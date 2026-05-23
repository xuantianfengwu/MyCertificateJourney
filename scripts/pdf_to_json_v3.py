#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
系统分析师章节练习PDF解析器 - 分离式版本
流程：PDF -> TXT -> JSON（章节分开存储）
"""

import os
import json
import re
import argparse
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    print("请先安装pdfplumber: pip install pdfplumber")
    exit(1)

class QuestionParser:
    """题目解析器"""

    def __init__(self):
        self.patterns = {
            # 题目编号
            'question_start': re.compile(r'^(试题\s*\d+|第\s*\d+\s*题|\d+\s*[．.、)】])\s*', re.MULTILINE),
            # 选项
            'option': re.compile(r'^[A-F][．.、)]\s+', re.MULTILINE),
            # 答案
            'answer': re.compile(r'[答][案]：?\s*【?\(?(\d+)?\)?\s*([A-F]+)】?', re.IGNORECASE),
            # 解析开始
            'analysis_start': re.compile(r'^试题分析\s*', re.MULTILINE),
            # 答案行
            'answer_line': re.compile(r'^试题答案\s*', re.MULTILINE),
            # 广告内容 - 多种模式
            'advertisement1': re.compile(r'软考达人：专业软考备考平台，免费提供\d+w\+软考题库，\d+TB免费软考备考资料', re.IGNORECASE),
            'advertisement2': re.compile(r'手机端题库：微信搜索[「"]*'),
            'advertisement3': re.compile(r'软考达人.*ruankaodaren\.com', re.IGNORECASE),
            # 页码
            'page_number': re.compile(r'^\d+\s*$'),
            # 年份题目标记
            'year_marker': re.compile(r'(\d{4})\s*年(上|下)半年试题\s*(\d+)')
        }

    def clean_text(self, text):
        """清理文本"""
        text = self.patterns['advertisement1'].sub('', text)
        text = self.patterns['advertisement2'].sub('', text)
        text = self.patterns['advertisement3'].sub('', text)
        lines = text.split('\n')
        cleaned_lines = []
        for line in lines:
            line = line.strip()
            if line and not self.patterns['page_number'].match(line):
                line = self.patterns['advertisement1'].sub('', line)
                line = self.patterns['advertisement2'].sub('', line)
                line = self.patterns['advertisement3'].sub('', line)
                # 清除残留的特殊符号
                line = line.replace('「', '').replace('」', '').replace('"', '').replace('"', '')
                if line.strip():
                    cleaned_lines.append(line)
        return '\n'.join(cleaned_lines)

    def pdf_to_txt(self, pdf_path, txt_path):
        """PDF转TXT"""
        text = ""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
            text = self.clean_text(text)
            with open(txt_path, 'w', encoding='utf-8') as f:
                f.write(text)
            print(f"  ✅ TXT文件已保存: {txt_path}")
            return text
        except Exception as e:
            print(f"  ❌ 解析PDF失败: {e}")
            return None

    def txt_to_questions(self, txt_path, chapter_name):
        """从TXT解析题目"""
        with open(txt_path, 'r', encoding='utf-8') as f:
            text = f.read()

        return self.parse_questions(text, chapter_name)

    def parse_questions(self, text, chapter_name):
        """解析题目"""
        questions = []
        lines = text.split('\n')

        current_question = None
        in_analysis = False
        expecting_answer = False

        for line in lines:
            line = line.strip()
            if not line:
                continue

            q_start_match = self.patterns['question_start'].match(line)
            year_match = self.patterns['year_marker'].search(line)

            if q_start_match or year_match:
                if current_question and current_question.get('question'):
                    questions.append(current_question)

                year = ""
                question_num = ""
                if year_match:
                    year = year_match.group(1) + "年" + ("上半年" if year_match.group(2) == '上' else "下半年")
                    question_num = year_match.group(3)

                question_text = self.patterns['question_start'].sub('', line)
                question_text = self.patterns['year_marker'].sub('', question_text).strip()

                current_question = {
                    'chapter': chapter_name,
                    'year': year,
                    'question_num': question_num,
                    'question': question_text,
                    'options': [],
                    'answer': '',
                    'analysis': '',
                    'question_type': 'single'
                }
                in_analysis = False
                expecting_answer = False
                continue

            if not current_question:
                continue

            option_match = self.patterns['option'].match(line)
            if option_match:
                option_key = option_match.group(0)[0]
                option_text = self.patterns['option'].sub('', line)
                if not any(opt['key'] == option_key for opt in current_question['options']):
                    current_question['options'].append({
                        'key': option_key,
                        'content': option_text
                    })
                continue

            if self.patterns['answer_line'].match(line):
                expecting_answer = True
                answer_match = self.patterns['answer'].search(line)
                if answer_match:
                    current_question['answer'] = answer_match.group(2)
                continue

            if expecting_answer:
                answer_match = self.patterns['answer'].search(line)
                if answer_match:
                    current_question['answer'] = answer_match.group(2)
                    expecting_answer = False
                continue

            if self.patterns['analysis_start'].match(line):
                in_analysis = True
                analysis_text = self.patterns['analysis_start'].sub('', line)
                current_question['analysis'] = analysis_text.strip()
                continue

            if in_analysis:
                current_question['analysis'] += '\n' + line
                continue

            if current_question['question']:
                current_question['question'] += '\n' + line

        if current_question and current_question.get('question'):
            questions.append(current_question)

        return self.clean_and_classify(questions)

    def clean_and_classify(self, questions):
        """清理并分类题目"""
        cleaned = []
        for q in questions:
            q['question'] = re.sub(r'\s+', ' ', q['question']).strip()
            q['options'] = [opt for opt in q['options'] if opt['content'].strip() and len(opt['content']) > 1]
            q['analysis'] = re.sub(r'\s+', ' ', q['analysis']).strip()

            if len(q['options']) >= 2:
                q['question_type'] = 'multiple' if len(q['answer']) > 1 else 'single'
            else:
                q['question_type'] = 'short'

            q['question_id'] = f"{q['chapter'][:3]}_{q['question_num']}"

            if len(q['question']) > 10 and (q['options'] or q['question_type'] == 'short'):
                cleaned.append(q)

        return cleaned

def generate_question_bank(input_dir, output_dir, study_project_id=4915):
    """生成题库结构"""
    parser = QuestionParser()
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    # 创建中间TXT目录
    txt_dir = Path(output_dir) / 'txt'
    txt_dir.mkdir(exist_ok=True)

    pdf_files = sorted(Path(input_dir).glob('*.pdf'))
    print(f"发现 {len(pdf_files)} 个PDF文件")

    # 保存章节列表
    chapters = []
    all_question_count = 0

    for pdf_path in pdf_files:
        print(f"\n正在处理: {pdf_path.name}")

        chapter_name = pdf_path.stem

        # 1. PDF转TXT
        txt_path = txt_dir / f"{pdf_path.stem}.txt"
        text = parser.pdf_to_txt(str(pdf_path), str(txt_path))
        if not text:
            print(f"  ⚠️ 跳过此文件")
            continue

        # 2. TXT转JSON（章节题目）
        questions = parser.txt_to_questions(str(txt_path), chapter_name)
        print(f"  ✅ 解析出 {len(questions)} 道题目")

        # 3. 保存章节JSON
        chapter_json_path = Path(output_dir) / f"{chapter_name}.json"
        with open(chapter_json_path, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
        print(f"  📄 章节JSON已保存: {chapter_json_path}")

        # 记录章节信息
        chapters.append({
            "chapterName": chapter_name,
            "questionCount": len(questions)
        })
        all_question_count += len(questions)

    # 4. 生成question_bank.json（仅包含章节列表）
    question_bank = {
        "studyProjectId": study_project_id,
        "examName": "系统分析师",
        "totalQuestions": all_question_count,
        "chapters": chapters
    }

    bank_path = Path(output_dir) / "question_bank.json"
    with open(bank_path, 'w', encoding='utf-8') as f:
        json.dump(question_bank, f, ensure_ascii=False, indent=2)
    print(f"\n📚 题库配置文件已保存: {bank_path}")
    print(f"📊 共解析 {all_question_count} 道题目，{len(chapters)} 个章节")

def main():
    parser = argparse.ArgumentParser(description='系统分析师章节练习PDF解析器')
    parser.add_argument('--input', '-i',
                        default='/Users/bytedance/WeChatProjects/MyCertificateJourney/exam_docs/ruankao/senior/system_analyst/chapter_practice',
                        help='PDF文件所在目录')
    parser.add_argument('--output', '-o',
                        default='/Users/bytedance/WeChatProjects/MyCertificateJourney/cloudbase/Storage/exam_docs/ruankao/senior/system_analyst/chapter_practice',
                        help='输出目录')
    parser.add_argument('--study-project-id', type=int, default=4915,
                        help='项目ID')

    args = parser.parse_args()
    generate_question_bank(args.input, args.output, args.study_project_id)

if __name__ == '__main__':
    main()
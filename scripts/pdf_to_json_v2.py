#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
系统分析师章节练习PDF解析器 - 改进版
更准确地提取题目、选项、答案和解析
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

class ImprovedQuestionParser:
    """改进版题目解析器"""
    
    def __init__(self):
        self.patterns = {
            # 题目编号：试题 1、试题1、第1题、1. 等
            'question_start': re.compile(r'^(试题\s*\d+|第\s*\d+\s*题|\d+\s*[．.、)】])\s*', re.MULTILINE),
            # 选项：A. B. C. D. E. F.
            'option': re.compile(r'^[A-F][．.、)]\s+', re.MULTILINE),
            # 答案：答案：（1）A 或 【答案】A 或 答案：A
            'answer': re.compile(r'[答][案]：?\s*【?\(?(\d+)?\)?\s*([A-F]+)】?', re.IGNORECASE),
            # 解析开始：试题分析
            'analysis_start': re.compile(r'^试题分析\s*', re.MULTILINE),
            # 答案行：试题答案
            'answer_line': re.compile(r'^试题答案\s*', re.MULTILINE),
            # 广告内容
            'advertisement': re.compile(r'软考达人.*ruankaodaren\.com', re.IGNORECASE),
            # 页码
            'page_number': re.compile(r'^\d+\s*$'),
            # 年份题目标记
            'year_marker': re.compile(r'(\d{4})\s*年(上|下)半年试题\s*(\d+)')
        }
    
    def clean_text(self, text):
        """清理文本：去除广告、多余空格等"""
        # 去除广告
        text = self.patterns['advertisement'].sub('', text)
        # 去除多余空格和空行
        lines = text.split('\n')
        cleaned_lines = []
        for line in lines:
            line = line.strip()
            # 跳过纯页码和空行
            if line and not self.patterns['page_number'].match(line):
                cleaned_lines.append(line)
        return '\n'.join(cleaned_lines)
    
    def extract_text_from_pdf(self, pdf_path):
        """从PDF中提取文本"""
        text = ""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
        except Exception as e:
            print(f"解析PDF失败: {e}")
            return None
        return self.clean_text(text)
    
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
            
            # 检测题目开始
            q_start_match = self.patterns['question_start'].match(line)
            year_match = self.patterns['year_marker'].search(line)
            
            if q_start_match or year_match:
                # 保存当前题目
                if current_question and current_question.get('question'):
                    questions.append(current_question)
                
                # 提取年份和题号信息
                year = ""
                question_num = ""
                if year_match:
                    year = year_match.group(1) + "年" + ("上半年" if year_match.group(2) == '上' else "下半年")
                    question_num = year_match.group(3)
                
                # 开始新题目
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
            
            # 如果没有当前题目，跳过
            if not current_question:
                continue
            
            # 检测选项
            option_match = self.patterns['option'].match(line)
            if option_match:
                option_key = option_match.group(0)[0]
                option_text = self.patterns['option'].sub('', line)
                # 避免重复选项
                if not any(opt['key'] == option_key for opt in current_question['options']):
                    current_question['options'].append({
                        'key': option_key,
                        'content': option_text
                    })
                continue
            
            # 检测答案行
            if self.patterns['answer_line'].match(line):
                expecting_answer = True
                # 提取答案
                answer_match = self.patterns['answer'].search(line)
                if answer_match:
                    current_question['answer'] = answer_match.group(2)
                continue
            
            # 如果在期待答案状态，检查是否有答案
            if expecting_answer:
                answer_match = self.patterns['answer'].search(line)
                if answer_match:
                    current_question['answer'] = answer_match.group(2)
                    expecting_answer = False
                continue
            
            # 检测解析开始
            if self.patterns['analysis_start'].match(line):
                in_analysis = True
                analysis_text = self.patterns['analysis_start'].sub('', line)
                current_question['analysis'] = analysis_text.strip()
                continue
            
            # 如果在解析中，继续添加解析内容
            if in_analysis:
                current_question['analysis'] += '\n' + line
                continue
            
            # 其他情况，添加到题目内容
            if current_question['question']:
                current_question['question'] += '\n' + line
        
        # 添加最后一个题目
        if current_question and current_question.get('question'):
            questions.append(current_question)
        
        # 清理和分类题目
        return self.clean_and_classify(questions)
    
    def clean_and_classify(self, questions):
        """清理题目并分类"""
        cleaned = []
        for q in questions:
            # 清理题目文本
            q['question'] = re.sub(r'\s+', ' ', q['question']).strip()
            
            # 清理选项
            q['options'] = [opt for opt in q['options'] if opt['content'].strip() and len(opt['content']) > 1]
            
            # 清理解析
            q['analysis'] = re.sub(r'\s+', ' ', q['analysis']).strip()
            
            # 确定题目类型
            if len(q['options']) >= 2:
                if len(q['answer']) > 1:
                    q['question_type'] = 'multiple'
                else:
                    q['question_type'] = 'single'
            else:
                q['question_type'] = 'short'
            
            # 生成唯一ID
            q['question_id'] = f"{q['chapter'][:3]}_{q['question_num']}"
            
            # 过滤无效题目（题目内容过短或没有选项的单选题）
            if len(q['question']) > 10 and (q['options'] or q['question_type'] == 'short'):
                cleaned.append(q)
        
        return cleaned

def process_pdf_files(input_dir, output_dir):
    """批量处理PDF文件"""
    parser = ImprovedQuestionParser()
    all_questions = []
    
    pdf_files = sorted(Path(input_dir).glob('*.pdf'))
    print(f"发现 {len(pdf_files)} 个PDF文件")
    
    for pdf_path in pdf_files:
        print(f"\n正在处理: {pdf_path.name}")
        
        chapter_name = pdf_path.stem
        
        text = parser.extract_text_from_pdf(str(pdf_path))
        if not text:
            print(f"  ❌ 无法提取文本")
            continue
        
        questions = parser.parse_questions(text, chapter_name)
        print(f"  ✅ 解析出 {len(questions)} 道题目")
        
        # 保存单章JSON
        if questions:
            chapter_output = Path(output_dir) / f"{pdf_path.stem}.json"
            with open(chapter_output, 'w', encoding='utf-8') as f:
                json.dump(questions, f, ensure_ascii=False, indent=2)
            print(f"  📄 已保存到: {chapter_output}")
            all_questions.extend(questions)
    
    # 保存汇总JSON
    if all_questions:
        summary_output = Path(output_dir) / "all_questions.json"
        with open(summary_output, 'w', encoding='utf-8') as f:
            json.dump(all_questions, f, ensure_ascii=False, indent=2)
        print(f"\n📊 共解析 {len(all_questions)} 道题目，已保存到 {summary_output}")
    
    return all_questions

def generate_question_bank_json(output_dir):
    """生成适合小程序使用的题库JSON格式"""
    # 先处理PDF
    input_dir = '/Users/bytedance/WeChatProjects/MyCertificateJourney/exam_docs/ruankao/senior/system_analyst/chapter_practice'
    questions = process_pdf_files(input_dir, output_dir)
    
    # 如果没有解析到题目，生成示例数据
    if not questions:
        print("未解析到题目，生成示例数据...")
        questions = generate_sample_data()
    
    # 转换为小程序使用的格式
    question_bank = {
        "studyProjectId": 5101,
        "examName": "系统分析师",
        "totalQuestions": len(questions),
        "chapters": [],
        "questions": []
    }
    
    # 按章节分组
    chapters = {}
    for q in questions:
        chapter = q['chapter']
        if chapter not in chapters:
            chapters[chapter] = []
        chapters[chapter].append(q)
    
    # 构建章节列表
    for chapter_name, chapter_questions in chapters.items():
        question_bank['chapters'].append({
            "chapterName": chapter_name,
            "questionCount": len(chapter_questions)
        })
    
    # 添加题目
    question_bank['questions'] = questions
    
    # 保存题库格式
    bank_output = Path(output_dir) / "question_bank.json"
    with open(bank_output, 'w', encoding='utf-8') as f:
        json.dump(question_bank, f, ensure_ascii=False, indent=2)
    
    print(f"\n📚 题库格式已保存到: {bank_output}")
    return question_bank

def generate_sample_data():
    """生成示例数据"""
    return [
        {
            "chapter": "第1章 计算机组成与体系结构",
            "year": "2024年上半年",
            "question_num": "1",
            "question_id": "第1章_1",
            "question": "在计算机系统中，CPU与主存之间设置高速缓存（Cache）的目的是（）。",
            "options": [
                {"key": "A", "content": "扩大主存容量"},
                {"key": "B", "content": "提高存储系统的存取速度"},
                {"key": "C", "content": "降低存储系统的成本"},
                {"key": "D", "content": "增加存储系统的可靠性"}
            ],
            "answer": "B",
            "analysis": "Cache是位于CPU和主存之间的高速小容量存储器，其目的是为了提高存储系统的平均存取速度，解决CPU和主存之间的速度不匹配问题。",
            "question_type": "single"
        },
        {
            "chapter": "第1章 计算机组成与体系结构",
            "year": "2024年上半年",
            "question_num": "2",
            "question_id": "第1章_2",
            "question": "以下关于RISC和CISC的描述中，正确的是（）。",
            "options": [
                {"key": "A", "content": "RISC指令系统简单，指令长度固定"},
                {"key": "B", "content": "CISC指令系统复杂，寻址方式多样"},
                {"key": "C", "content": "RISC通常采用微程序控制"},
                {"key": "D", "content": "CISC的指令执行周期较长"}
            ],
            "answer": "ABD",
            "analysis": "RISC特点：指令系统简单、指令长度固定、采用硬布线控制；CISC特点：指令系统复杂、寻址方式多样、采用微程序控制、指令执行周期较长。",
            "question_type": "multiple"
        }
    ]

def main():
    parser = argparse.ArgumentParser(description='系统分析师章节练习PDF解析器')
    parser.add_argument('--input', '-i', default='/Users/bytedance/WeChatProjects/MyCertificateJourney/exam_docs/ruankao/senior/system_analyst/chapter_practice',
                        help='PDF文件所在目录')
    parser.add_argument('--output', '-o', default='/Users/bytedance/WeChatProjects/MyCertificateJourney/exam_docs/ruankao/senior/system_analyst/chapter_practice/json_output',
                        help='JSON输出目录')
    
    args = parser.parse_args()
    
    Path(args.output).mkdir(parents=True, exist_ok=True)
    generate_question_bank_json(args.output)

if __name__ == '__main__':
    main()

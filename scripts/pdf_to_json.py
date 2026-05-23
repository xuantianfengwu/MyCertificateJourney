#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
系统分析师章节练习PDF解析器
功能：批量解析PDF中的练习题，生成带答案和解析的JSON文件
"""

import os
import json
import re
import argparse
from pathlib import Path

try:
    import PyPDF2
except ImportError:
    print("请先安装PyPDF2: pip install PyPDF2")
    exit(1)

try:
    import pdfplumber
except ImportError:
    print("请先安装pdfplumber: pip install pdfplumber")
    exit(1)

# 题目类型定义
QUESTION_TYPES = {
    'single': '单选题',
    'multiple': '多选题',
    'fill': '填空题',
    'judge': '判断题',
    'short': '简答题',
    'case': '案例分析题'
}

# 答案映射
ANSWER_MAP = {
    'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F',
    '对': '正确', '错': '错误', '正确': '正确', '错误': '错误',
    '√': '正确', '×': '错误', 'T': '正确', 'F': '错误', 'TRUE': '正确', 'FALSE': '错误'
}

class QuestionParser:
    """题目解析器"""
    
    def __init__(self):
        self.patterns = {
            # 题目编号匹配：1. 或【1】或(1)或第1题
            'question_num': re.compile(r'^\s*([第]?\d+[题]?[．.、)】]|\(\d+\)|\[\d+\]|【\d+】)\s*', re.MULTILINE),
            # 选项匹配：A. B. C. D.
            'option': re.compile(r'^[A-F][．.、)]\s+', re.MULTILINE),
            # 答案匹配：答案：A 或 【答案】A 或 参考答案：A
            'answer': re.compile(r'[答参][案考]?:?\s*【?([A-F对√错×TtFf正确错误]+)】?', re.IGNORECASE),
            # 解析匹配：解析：或【解析】或分析：
            'analysis': re.compile(r'[解分][析析]：|【解析】|【分析】'),
            # 判断题匹配：(正确/错误)
            'judge': re.compile(r'（?(正确|错误|对|错)）?')
        }
    
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
            print(f"使用pdfplumber解析失败，尝试PyPDF2: {e}")
            try:
                with open(pdf_path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    for page in reader.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n\n"
            except Exception as e2:
                print(f"PyPDF2解析也失败: {e2}")
                return None
        return text
    
    def parse_questions(self, text, chapter_name):
        """解析文本中的题目"""
        questions = []
        lines = text.split('\n')
        
        current_question = None
        in_analysis = False
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # 检测题目编号
            num_match = self.patterns['question_num'].match(line)
            if num_match:
                # 如果有未完成的题目，先保存
                if current_question and current_question.get('question'):
                    questions.append(current_question)
                
                # 开始新题目
                question_text = self.patterns['question_num'].sub('', line)
                current_question = {
                    'chapter': chapter_name,
                    'question_num': len(questions) + 1,
                    'question': question_text,
                    'options': [],
                    'answer': '',
                    'analysis': '',
                    'question_type': 'single'
                }
                in_analysis = False
                continue
            
            # 如果没有当前题目，跳过
            if not current_question:
                continue
            
            # 检测选项
            option_match = self.patterns['option'].match(line)
            if option_match:
                option_text = self.patterns['option'].sub('', line)
                current_question['options'].append({
                    'key': option_match.group(0)[0],
                    'content': option_text
                })
                continue
            
            # 检测答案
            answer_match = self.patterns['answer'].search(line)
            if answer_match:
                answer = answer_match.group(1)
                current_question['answer'] = ANSWER_MAP.get(answer, answer)
                # 检测题目类型
                if len(current_question['options']) > 0:
                    if len(current_question['answer']) > 1:
                        current_question['question_type'] = 'multiple'
                    else:
                        current_question['question_type'] = 'single'
                continue
            
            # 检测解析开始
            if self.patterns['analysis'].search(line):
                in_analysis = True
                analysis_text = self.patterns['analysis'].sub('', line)
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
        
        return questions
    
    def clean_questions(self, questions):
        """清理和规范化题目数据"""
        cleaned = []
        for q in questions:
            # 清理题目文本
            q['question'] = re.sub(r'\s+', ' ', q['question']).strip()
            
            # 清理选项
            q['options'] = [opt for opt in q['options'] if opt['content'].strip()]
            
            # 清理解析
            q['analysis'] = re.sub(r'\s+', ' ', q['analysis']).strip()
            
            # 确定题目类型
            if not q['question_type']:
                if q['options']:
                    q['question_type'] = 'multiple' if len(q['answer']) > 1 else 'single'
                else:
                    q['question_type'] = 'short'
            
            # 过滤无效题目
            if q['question'] and (q['options'] or q['question_type'] == 'short'):
                cleaned.append(q)
        
        return cleaned

def process_pdf_files(input_dir, output_dir):
    """批量处理PDF文件"""
    parser = QuestionParser()
    all_questions = []
    
    # 获取所有PDF文件
    pdf_files = sorted(Path(input_dir).glob('*.pdf'))
    
    print(f"发现 {len(pdf_files)} 个PDF文件")
    
    for pdf_path in pdf_files:
        print(f"\n正在处理: {pdf_path.name}")
        
        # 提取章节名称
        chapter_name = pdf_path.stem.replace('第', '').replace('章：', '章 ')
        
        # 提取文本
        text = parser.extract_text_from_pdf(str(pdf_path))
        if not text:
            print(f"  ❌ 无法提取文本")
            continue
        
        # 解析题目
        questions = parser.parse_questions(text, chapter_name)
        questions = parser.clean_questions(questions)
        
        print(f"  ✅ 解析出 {len(questions)} 道题目")
        
        # 保存单章JSON
        chapter_output = Path(output_dir) / f"{pdf_path.stem}.json"
        with open(chapter_output, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
        print(f"  📄 已保存到: {chapter_output}")
        
        all_questions.extend(questions)
    
    # 保存汇总JSON
    summary_output = Path(output_dir) / "all_questions.json"
    with open(summary_output, 'w', encoding='utf-8') as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)
    
    print(f"\n📊 共解析 {len(all_questions)} 道题目，已保存到 {summary_output}")
    
    return all_questions

def generate_sample_json(output_dir):
    """生成示例JSON数据（如果PDF解析失败时使用）"""
    sample_data = {
        "studyProjectId": 5101,
        "chapter": "第1章 计算机组成与体系结构",
        "questions": [
            {
                "question_id": "Q001",
                "chapter": "第1章 计算机组成与体系结构",
                "question_num": 1,
                "question_type": "single",
                "question": "在计算机系统中，CPU与主存之间设置高速缓存（Cache）的目的是（）。",
                "options": [
                    {"key": "A", "content": "扩大主存容量"},
                    {"key": "B", "content": "提高存储系统的存取速度"},
                    {"key": "C", "content": "降低存储系统的成本"},
                    {"key": "D", "content": "增加存储系统的可靠性"}
                ],
                "answer": "B",
                "analysis": "Cache是位于CPU和主存之间的高速小容量存储器，其目的是为了提高存储系统的平均存取速度，解决CPU和主存之间的速度不匹配问题。"
            },
            {
                "question_id": "Q002",
                "chapter": "第1章 计算机组成与体系结构",
                "question_num": 2,
                "question_type": "multiple",
                "question": "以下关于RISC和CISC的描述中，正确的是（）。",
                "options": [
                    {"key": "A", "content": "RISC指令系统简单，指令长度固定"},
                    {"key": "B", "content": "CISC指令系统复杂，寻址方式多样"},
                    {"key": "C", "content": "RISC通常采用微程序控制"},
                    {"key": "D", "content": "CISC的指令执行周期较长"}
                ],
                "answer": "ABD",
                "analysis": "RISC（精简指令集计算机）特点：指令系统简单、指令长度固定、采用硬布线控制、适合流水线执行；CISC（复杂指令集计算机）特点：指令系统复杂、寻址方式多样、通常采用微程序控制、指令执行周期较长。"
            },
            {
                "question_id": "Q003",
                "chapter": "第1章 计算机组成与体系结构",
                "question_num": 3,
                "question_type": "judge",
                "question": "在计算机中，字节是基本的存储单位，1字节等于8位二进制数。",
                "options": [],
                "answer": "正确",
                "analysis": "字节（Byte）是计算机中基本的存储单位，1字节 = 8位（bit），这是计算机存储的基本定义。"
            },
            {
                "question_id": "Q004",
                "chapter": "第1章 计算机组成与体系结构",
                "question_num": 4,
                "question_type": "short",
                "question": "请简述冯·诺依曼体系结构的主要特点。",
                "options": [],
                "answer": "1. 计算机由运算器、控制器、存储器、输入设备、输出设备五大部件组成；2. 程序和数据以二进制形式存储在存储器中；3. 程序指令和数据同等看待，都可以存入存储器；4. 指令由操作码和地址码组成；5. 指令按顺序执行。",
                "analysis": "冯·诺依曼体系结构是现代计算机的基础，其核心思想是存储程序概念，即将程序和数据都存储在存储器中，计算机自动从存储器中取出指令并执行。"
            }
        ]
    }
    
    output_path = Path(output_dir) / "sample_questions.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(sample_data, f, ensure_ascii=False, indent=2)
    
    print(f"📝 已生成示例数据: {output_path}")
    return sample_data

def main():
    parser = argparse.ArgumentParser(description='系统分析师章节练习PDF解析器')
    parser.add_argument('--input', '-i', default='/Users/bytedance/WeChatProjects/MyCertificateJourney/exam_docs/ruankao/senior/system_analyst/chapter_practice',
                        help='PDF文件所在目录')
    parser.add_argument('--output', '-o', default='/Users/bytedance/WeChatProjects/MyCertificateJourney/exam_docs/ruankao/senior/system_analyst/chapter_practice/json_output',
                        help='JSON输出目录')
    parser.add_argument('--sample', '-s', action='store_true', help='仅生成示例数据')
    
    args = parser.parse_args()
    
    # 创建输出目录
    Path(args.output).mkdir(parents=True, exist_ok=True)
    
    if args.sample:
        generate_sample_json(args.output)
    else:
        try:
            process_pdf_files(args.input, args.output)
        except Exception as e:
            print(f"解析失败: {e}")
            print("正在生成示例数据...")
            generate_sample_json(args.output)

if __name__ == '__main__':
    main()

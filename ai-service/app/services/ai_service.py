from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from typing import Dict, List
import os

class BugAnalysisService:
    def __init__(self):
        """Initialize LangChain with OpenAI"""
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.3,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        
    def analyze_environment(self, environment_data: Dict) -> str:
        """Analyze environment data and generate summary"""
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a technical bug analysis expert. Analyze the environment data and provide a concise summary."),
            ("user", """Analyze this environment data and provide a summary:
Browser: {browser}
OS: {os}
Viewport: {viewport_width}x{viewport_height}
Screen: {screen_width}x{screen_height}
Device: {device_type}
URL: {url}
Language: {language}
CPU Cores: {hardware_concurrency}
RAM: {device_memory}GB

Provide a concise summary in format: "Browser/OS - Device Type - Resolution" """)
        ])
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        
        try:
            result = chain.run(
                browser=environment_data.get('browser', 'Unknown'),
                os=environment_data.get('os', 'Unknown'),
                viewport_width=environment_data.get('viewport_width', 'Unknown'),
                viewport_height=environment_data.get('viewport_height', 'Unknown'),
                screen_width=environment_data.get('screen_width', 'Unknown'),
                screen_height=environment_data.get('screen_height', 'Unknown'),
                device_type=environment_data.get('device_type', 'Unknown'),
                url=environment_data.get('url', 'Unknown'),
                language=environment_data.get('language', 'Unknown'),
                hardware_concurrency=environment_data.get('hardware_concurrency', 'Unknown'),
                device_memory=environment_data.get('device_memory', 'Unknown')
            )
            return result.strip()
        except Exception as e:
            return f"Environment: {environment_data.get('browser', 'Unknown')} on {environment_data.get('os', 'Unknown')}"
    
    def enhance_bug_report(self, title: str, description: str, environment_data: Dict, 
                          console_errors: List[str] = None, failed_requests: List[Dict] = None) -> Dict:
        """Enhance bug report using AI analysis"""
        
        console_errors = console_errors or []
        failed_requests = failed_requests or []
        
        environment_summary = self.analyze_environment(environment_data)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a technical bug report analyst. Enhance bug reports with better titles, descriptions, and severity suggestions.
            
            Return response in this exact format:
            ENHANCED_TITLE: [enhanced title]
            ENHANCED_DESCRIPTION: [enhanced description]
            SEVERITY: [low|medium|high|critical]
            TAGS: [tag1, tag2, tag3]
            REPRODUCTION_STEPS: [step1, step2, step3]"""),
            
            ("user", """Original Bug Report:
Title: {title}
Description: {description}

Environment Context:
{environment_summary}

Console Errors: {console_errors}

Failed Requests: {failed_requests}

Enhance this bug report.""")
        ])
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        
        try:
            result = chain.run(
                title=title,
                description=description,
                environment_summary=environment_summary,
                console_errors=str(console_errors) if console_errors else "None",
                failed_requests=str(failed_requests) if failed_requests else "None"
            )
            
            # Parse the response
            enhanced_data = self._parse_ai_response(result)
            enhanced_data['environment_summary'] = environment_summary
            
            return enhanced_data
            
        except Exception as e:
            # Fallback to basic enhancement
            return {
                'enhanced_title': title,
                'enhanced_description': description,
                'severity_suggestion': 'medium',
                'environment_summary': environment_summary,
                'suggested_tags': ['bug', 'needs-review'],
                'reproduction_steps': []
            }
    
    def _parse_ai_response(self, response: str) -> Dict:
        """Parse AI response into structured data"""
        enhanced_data = {
            'enhanced_title': '',
            'enhanced_description': '',
            'severity_suggestion': 'medium',
            'suggested_tags': [],
            'reproduction_steps': []
        }
        
        lines = response.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            if line.startswith('ENHANCED_TITLE:'):
                enhanced_data['enhanced_title'] = line.replace('ENHANCED_TITLE:', '').strip()
            elif line.startswith('ENHANCED_DESCRIPTION:'):
                enhanced_data['enhanced_description'] = line.replace('ENHANCED_DESCRIPTION:', '').strip()
            elif line.startswith('SEVERITY:'):
                severity = line.replace('SEVERITY:', '').strip().lower()
                if severity in ['low', 'medium', 'high', 'critical']:
                    enhanced_data['severity_suggestion'] = severity
            elif line.startswith('TAGS:'):
                tags_str = line.replace('TAGS:', '').strip()
                enhanced_data['suggested_tags'] = [tag.strip() for tag in tags_str.split(',')]
            elif line.startswith('REPRODUCTION_STEPS:'):
                steps_str = line.replace('REPRODUCTION_STEPS:', '').strip()
                enhanced_data['reproduction_steps'] = [step.strip() for step in steps_str.split(',')]
        
        # Set defaults if parsing failed
        if not enhanced_data['enhanced_title']:
            enhanced_data['enhanced_title'] = 'Bug Report'
        if not enhanced_data['enhanced_description']:
            enhanced_data['enhanced_description'] = 'No description provided'
        if not enhanced_data['suggested_tags']:
            enhanced_data['suggested_tags'] = ['bug']
            
        return enhanced_data
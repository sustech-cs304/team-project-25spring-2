import os
import sys

# 获取项目根目录路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# 添加到Python路径
sys.path.insert(0, project_root) 
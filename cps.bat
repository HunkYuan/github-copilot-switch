@echo off
REM Copilot Switch CLI Launcher - 直接以 GUI 激活的配置启动 Copilot
REM 将此脚本所在目录加入 PATH，即可在任意位置运行 cps

python "%~dp0cps.py" %*

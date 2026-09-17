#!/usr/bin/python3 -I
"""Forced SSH command, installed root-owned outside the uploaded source directory."""
import os
import re
import sys

command = os.environ.get('SSH_ORIGINAL_COMMAND', '')
if command.startswith('rsync --server '):
    os.execv('/usr/bin/rrsync', ['rrsync', '-wo', '-no-del', '/srv/tarot/source'])
match = re.fullmatch(r'(prepare|activate) ([0-9a-f]{40})', command)
if match:
    os.execv('/usr/bin/sudo', ['sudo', '-n', '/usr/local/sbin/tarot-release', match[1], match[2]])
if command == 'rollback':
    os.execv('/usr/bin/sudo', ['sudo', '-n', '/usr/local/sbin/tarot-release', 'rollback'])
sys.exit('Only restricted rsync, prepare SHA, activate SHA, or rollback are allowed')

document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const chatContent = document.getElementById('chatContent');
    const manualInput = document.getElementById('manualInput');
    const addMessageBtn = document.getElementById('addMessage');
    // const importFileInput = document.getElementById('importFile');
    // const importBtn = document.getElementById('importBtn');
    const clearChatBtn = document.getElementById('clearChat');
    const exportChatBtn = document.getElementById('exportChat');
    const exportImageBtn = document.getElementById('exportImage');
    const chatWidthSlider = document.getElementById('chatWidth');
    const chatHeightSlider = document.getElementById('chatHeight');
    const chatWidthValue = document.getElementById('chatWidthValue');
    const chatHeightValue = document.getElementById('chatHeightValue');
    const chatContainer = document.getElementById('chatContainer');
    const dialogBoxContainer = document.getElementById('dialogBoxContainer');

    // DeepSeek头像URL
    const deepseekAvatarUrl = 'deepseek-avatar.png';

    // 操作按钮图标URL
    const actionIcons = {
        copy: 'icon-copy.svg',
        refresh: 'icon-refresh.svg',
        like: 'icon-like.svg',
        dislike: 'icon-dislike.svg'
    };

    // 初始化聊天区域大小
    updateChatSize();
    
    // 初始化时显示模拟对话框
    dialogBoxContainer.style.display = 'block';
    
    // 添加消息按钮点击事件
    addMessageBtn.addEventListener('click', function() {
        addMessageFromInput();
    });
  
  
    // 回车键添加消息
    manualInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addMessageFromInput();
        }
    });

    // // 导入对话按钮点击事件
    // importBtn.addEventListener('click', function() {
    //     importFileInput.click();
    // });

    // 文件选择事件
    // importFileInput.addEventListener('change', function(e) {
    //     const file = e.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onload = function(e) {
    //             const content = e.target.result;
    //             processImportedContent(content);
    //         };
    //         reader.readAsText(file);
    //     }
    // });

    // 清空对话按钮点击事件
    clearChatBtn.addEventListener('click', function() {
        chatContent.innerHTML = '';
    });

    // 导出对话按钮点击事件
    exportChatBtn.addEventListener('click', function() {
        exportChat();
    });

    // 导出图片按钮点击事件
    exportImageBtn.addEventListener('click', function() {
        alert('导出图片功能需要使用html2canvas等库实现，此处为示例');
    });

    // 聊天区域大小调整事件
    chatWidthSlider.addEventListener('input', updateChatSize);
    chatHeightSlider.addEventListener('input', updateChatSize);

    // 从输入框添加消息
    function addMessageFromInput() {
        const text = manualInput.value.trim();
        if (text) {
            const lines = text.split('\n');
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine) {
                    processMessageLine(trimmedLine);
                }
            });
            manualInput.value = '';
        }
    }

    // 处理导入的内容
    function processImportedContent(content) {
        const lines = content.split('\n');
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('画面：')) {
                processMessageLine(trimmedLine);
            }
        });
    }

    // 处理单行消息
    function processMessageLine(line) {
        const colonPattern = /^([AB])[:：]\s*(.*)/;
        const match = line.match(colonPattern);
        if (match) {
            const [, speaker, message] = match;
            const trimmedMessage = message.trim();
            if (speaker === 'A') {
                addUserMessage(trimmedMessage);
            } else if (speaker === 'B') {
                addDeepseekMessage(trimmedMessage);
            }
        }
    }

    // 添加用户消息
    function addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-content">${message}</div>
        `;
        chatContent.appendChild(messageDiv);
        chatContent.scrollTop = chatContent.scrollHeight;
    }

    // 添加DeepSeek消息
    function addDeepseekMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message deepseek-message';
        messageDiv.innerHTML = `
            <div class="message-header">
                <div class="deepseek-avatar">
                    <img src="${deepseekAvatarUrl}" alt="DeepSeek">
                </div>
                <div class="message-content">${message}</div>
            </div>
            <div class="message-actions">
                <button class="action-button" title="复制">
                    <img src="${actionIcons.copy}" alt="复制">
                </button>
                <button class="action-button" title="刷新">
                    <img src="${actionIcons.refresh}" alt="刷新">
                </button>
                <button class="action-button" title="点赞">
                    <img src="${actionIcons.like}" alt="点赞">
                </button>
                <button class="action-button" title="点踩">
                    <img src="${actionIcons.dislike}" alt="点踩">
                </button>
            </div>
        `;
        chatContent.appendChild(messageDiv);
        chatContent.scrollTop = chatContent.scrollHeight;
        
        // 添加操作按钮事件
        const copyBtn = messageDiv.querySelector('.action-button[title="复制"]');
        copyBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(message)
                .then(() => alert('已复制到剪贴板'))
                .catch(err => console.error('复制失败:', err));
        });
    }

    // 更新聊天区域大小
    function updateChatSize() {
        const width = chatWidthSlider.value;
        const height = chatHeightSlider.value;
        
        // 调整整个聊天容器的宽度
        chatContainer.style.width = `${width}px`;
        
        // 调整聊天内容区域的宽度和高度
        chatContent.style.width = `${width}px`;
        chatContent.style.height = `${height}px`;
        
        // 调整底部对话框的宽度
        dialogBoxContainer.style.width = `${width}px`;
        dialogBoxContainer.style.maxWidth = `${width}px`;
        
        // 更新显示的数值
        chatWidthValue.textContent = `${width}px`;
        chatHeightValue.textContent = `${height}px`;
    }

    // 导出对话
    function exportChat() {
        let content = '';
        const messages = chatContent.querySelectorAll('.message');
        
        messages.forEach(message => {
            const messageContent = message.querySelector('.message-content').textContent;
            if (message.classList.contains('user-message')) {
                content += `A: ${messageContent}\n`;
            } else {
                content += `B: ${messageContent}\n`;
            }
        });
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'deepseek-chat.text';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});
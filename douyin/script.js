document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const chatContent = document.getElementById('chatContent');
    const manualInput = document.getElementById('manualInput');
    const addMessageBtn = document.getElementById('addMessage');
    const importFileInput = document.getElementById('importFile');
    const importBtn = document.getElementById('importBtn');
    const clearChatBtn = document.getElementById('clearChat');
    const exportChatBtn = document.getElementById('exportChat');
    const exportImageBtn = document.getElementById('exportImage');
    const chatWidthSlider = document.getElementById('chatWidth');
    const chatWidthValue = document.getElementById('chatWidthValue');
    const chatContainer = document.getElementById('chatContainer');
    const avatarInput = document.getElementById('avatarInput');
    const nameInput = document.getElementById('nameInput');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const videoCallDiv = document.querySelector('.video-call');
    const settingsContainer = document.getElementById('settingsContainer');
    const settingsToggle = document.getElementById('settingsToggle');
    
    // 添加高度调节滑块元素
    const chatHeightSlider = document.createElement('input');
    chatHeightSlider.type = 'range';
    chatHeightSlider.id = 'chatHeight';
    chatHeightSlider.min = '300';
    chatHeightSlider.max = '1000';
    chatHeightSlider.value = '700';
    
    const chatHeightValue = document.createElement('span');
    chatHeightValue.id = 'chatHeightValue';
    chatHeightValue.textContent = '700px';
    
    // 找到宽度控制的父元素
    const sizeControls = document.querySelector('.size-controls');
    
    // 创建高度控制的容器
    const heightControlDiv = document.createElement('div');
    heightControlDiv.className = 'size-controls';
    heightControlDiv.innerHTML = `
        <label for="chatHeight">高度:</label>
    `;
    
    // 添加高度滑块和值显示
    heightControlDiv.appendChild(chatHeightSlider);
    heightControlDiv.appendChild(chatHeightValue);
    
    // 将高度控制添加到宽度控制的父元素后面
    sizeControls.parentNode.insertBefore(heightControlDiv, sizeControls.nextSibling);
    
    // 设置视频通话图标
    videoCallDiv.innerHTML = '<img src="takephoto.png" alt="视频通话" style="width: 24px; height: 24px;">';
    
    // 初始化对方头像和昵称
    let otherAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMTAwIiBmaWxsPSIjMjJhMmZmIi8+CiAgICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz4KICAgIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjE4MCIgcj0iNTUiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC44Ii8+Cjwvc3ZnPg==';
    let otherName = '对方昵称';
    
    // 设置默认头像为蓝色对方头像
    userAvatar.src = otherAvatar;
    userName.textContent = otherName;

    // 初始化聊天区域大小
    updateChatSize();
    
    // 设置面板展开收起功能
    settingsToggle.addEventListener('click', function() {
        settingsContainer.classList.toggle('collapsed');
    });
    
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

    // 导入对话按钮点击事件
    importBtn.addEventListener('click', function() {
        importFileInput.click();
    });

    // 文件选择事件
    importFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                processImportedContent(content);
            };
            reader.readAsText(file);
        }
    });

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

    // 初始化我的头像和昵称
    let myAvatar = 'default-avatar.png';
    let myName = '我的昵称';
    
    // 我的头像上传事件 - 更新我的头像和所有已发送消息的头像
    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                myAvatar = e.target.result;
                // 更新所有已发送消息的头像
                const sentMessages = document.querySelectorAll('.message.sent .message-avatar img');
                sentMessages.forEach(avatar => {
                    avatar.src = myAvatar;
                });
            };
            reader.readAsDataURL(file);
        }
    });

    // 我的昵称修改事件 - 不影响顶部显示
    nameInput.addEventListener('input', function(e) {
        myName = e.target.value || '我的昵称';
    });

    // 对方头像上传事件 - 更新顶部头像和所有接收消息的头像
    const otherAvatarInput = document.getElementById('otherAvatarInput');
    otherAvatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                otherAvatar = e.target.result;
                userAvatar.src = otherAvatar;
                // 更新所有接收消息的头像
                const receivedMessages = document.querySelectorAll('.message.received .message-avatar img');
                receivedMessages.forEach(avatar => {
                    avatar.src = otherAvatar;
                });
            };
            reader.readAsDataURL(file);
        }
    });

    // 对方昵称修改事件
    const otherNameInput = document.getElementById('otherNameInput');
    otherNameInput.addEventListener('input', function(e) {
        otherName = e.target.value || '对方昵称';
        userName.textContent = otherName;
    });

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
        const colonPattern = /^([AB])[:：]\s*(.*)$/;
        const match = line.match(colonPattern);
        if (match) {
            const [, speaker, message] = match;
            const trimmedMessage = message.trim();
            if (speaker === 'A') {
                addUserMessage(trimmedMessage);
            } else if (speaker === 'B') {
                addBotMessage(trimmedMessage);
            }
        }
    }

    // 添加用户消息
    function addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message sent';
        
        // 创建头像元素
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar my-avatar';
        
        // 创建图片元素
        const img = document.createElement('img');
        img.src = myAvatar;
        img.alt = myName || '用户头像';
        img.onerror = function() {
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMTAwIiBmaWxsPSIjZmU0MzY1Ii8+CiAgICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz4KICAgIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjE4MCIgcj0iNTUiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC44Ii8+Cjwvc3ZnPg==';
        };
        
        // 添加图片到头像div
        avatarDiv.appendChild(img);
        
        // 创建消息内容元素
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = message;
        
        // 添加头像和内容到消息div
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        chatContent.appendChild(messageDiv);
        chatContent.scrollTop = chatContent.scrollHeight;
    }

    // 添加机器人消息
    function addBotMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message received';
        
        // 创建头像元素
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar other-avatar';
        
        // 创建图片元素
        const img = document.createElement('img');
        img.src = otherAvatar;
        img.alt = otherName || '对方头像';
        img.onerror = function() {
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMTAwIiBmaWxsPSIjMjJhMmZmIi8+CiAgICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz4KICAgIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjE4MCIgcj0iNTUiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC44Ii8+Cjwvc3ZnPg==';
        };
        
        // 添加图片到头像div
        avatarDiv.appendChild(img);
        
        // 创建消息内容元素
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = message;
        
        // 添加头像和内容到消息div
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        chatContent.appendChild(messageDiv);
        chatContent.scrollTop = chatContent.scrollHeight;
    }

    // 更新聊天区域大小
    function updateChatSize() {
        const width = chatWidthSlider.value;
        const height = chatHeightSlider.value;
        
        // 调整整个聊天容器的宽度和高度
        chatContainer.style.width = `${width}px`;
        chatContainer.style.height = `${height}px`;
        
        // 调整聊天头部和底部区域的宽度
        const chatHeader = document.querySelector('.chat-header');
        const chatBottom = document.querySelector('.chat-bottom');
        if (chatHeader) chatHeader.style.width = `${width}px`;
        if (chatBottom) chatBottom.style.width = `${width}px`;
        
        // 调整聊天内容区域的宽度和高度
        chatContent.style.width = `${width}px`;
        chatContent.style.height = `${height - 90}px`; // 减去头部和底部的高度，确保内容区域适当
        
        // 更新显示的数值
        chatWidthValue.textContent = `${width}px`;
        chatHeightValue.textContent = `${height}px`;
    }
    
    // 监听滑块变化事件
    chatWidthSlider.addEventListener('input', updateChatSize);

    // 导出对话
    function exportChat() {
        let content = '';
        const messages = chatContent.querySelectorAll('.message');
        
        messages.forEach(message => {
            const messageContent = message.querySelector('.message-content').textContent;
            if (message.classList.contains('sent')) {
                content += `A: ${messageContent}\n`;
            } else {
                content += `B: ${messageContent}\n`;
            }
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chat-export.txt';
        a.click();
        URL.revokeObjectURL(url);
    }
})
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const phoneFrame = document.getElementById('phone-frame');
    const chatArea = document.getElementById('chat-area');
    const contactName = document.getElementById('contact-name');
    const contactAvatar = document.getElementById('contact-avatar');
    const contactNameInput = document.getElementById('contact-name-input');
    const avatarUpload = document.getElementById('avatar-upload');
    const phoneWidth = document.getElementById('phone-width');
    const phoneHeight = document.getElementById('phone-height');
    const chatImport = document.getElementById('chat-import');
    const importBtn = document.getElementById('import-btn');
    const generateBtn = document.getElementById('generate-btn');
    const saveBtn = document.getElementById('save-btn');
    const togglePanelBtn = document.getElementById('toggle-panel');
    const settingsPanel = document.getElementById('settings-panel');
    
    // 设置面板展开/收起功能
    togglePanelBtn.addEventListener('click', function() {
        settingsPanel.classList.toggle('collapsed');
        togglePanelBtn.textContent = settingsPanel.classList.contains('collapsed') ? '展开' : '收起';
    });
    
    // 更新联系人昵称
    contactNameInput.addEventListener('input', function() {
        contactName.textContent = this.value;
    });
    
    // 更新联系人头像
    avatarUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                contactAvatar.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 调整手机尺寸
    function updatePhoneSize() {
        phoneFrame.style.width = phoneWidth.value + 'px';
        phoneFrame.style.height = phoneHeight.value + 'px';
    }
    
    phoneWidth.addEventListener('input', updatePhoneSize);
    phoneHeight.addEventListener('input', updatePhoneSize);
    
    // 解析聊天记录
    function parseChat(text) {
        const lines = text.split('\n');
        const messages = [];
        let currentTime = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            if (line.startsWith('time:')) {
                currentTime = line.substring(5).trim();
            } else if (line.startsWith('A:') || line.startsWith('B:')) {
                const sender = line.substring(0, 1);
                const content = line.substring(2).trim();
                messages.push({
                    time: currentTime,
                    sender: sender,
                    content: content
                });
                currentTime = ''; // 重置时间，避免重复
            } else if (line.startsWith('画面:')) {
                const adContent = line.substring(3).trim();
                messages.push({
                    type: 'ad',
                    content: adContent
                });
            }
        }
        
        return messages;
    }
    
    // 生成聊天界面
    function generateChat(messages) {
        chatArea.innerHTML = '';
        let lastTime = '';
        
        messages.forEach(message => {
            if (message.type === 'ad') {
                // 广告消息
                const adDiv = document.createElement('div');
                adDiv.className = 'ad-message';
                adDiv.textContent = message.content;
                chatArea.appendChild(adDiv);
                return;
            }
            
            // 显示时间（如果与上一条不同）
            if (message.time && message.time !== lastTime) {
                const timeDiv = document.createElement('div');
                timeDiv.className = 'time';
                timeDiv.textContent = message.time;
                chatArea.appendChild(timeDiv);
                lastTime = message.time;
            }
            
            // 创建消息气泡
            const messageDiv = document.createElement('div');
            messageDiv.className = `message message-${message.sender.toLowerCase()}`;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = message.content;
            
            messageDiv.appendChild(contentDiv);
            chatArea.appendChild(messageDiv);
            
            // 清除浮动
            const clearDiv = document.createElement('div');
            clearDiv.className = 'clearfix';
            chatArea.appendChild(clearDiv);
        });
        
        // 滚动到底部
        chatArea.scrollTop = chatArea.scrollHeight;
    }
    
    // 导入按钮点击事件
    importBtn.addEventListener('click', function() {
        const chatText = chatImport.value;
        if (chatText) {
            const messages = parseChat(chatText);
            generateChat(messages);
        } else {
            alert('请输入聊天记录');
        }
    });
    
    // 生成按钮点击事件（与导入功能相同，为了用户体验）
    generateBtn.addEventListener('click', function() {
        importBtn.click();
    });
    
    // 保存为图片
    saveBtn.addEventListener('click', function() {
        html2canvas(phoneFrame).then(canvas => {
            const link = document.createElement('a');
            link.download = '聊天记录_' + new Date().getTime() + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });
    
    // 加载示例聊天记录
    function loadSampleChat() {
        fetch('test.text')
            .then(response => response.text())
            .then(text => {
                chatImport.value = text;
                const messages = parseChat(text);
                generateChat(messages);
            })
            .catch(error => {
                console.error('加载示例聊天记录失败:', error);
            });
    }
    
    // 初始化
    updatePhoneSize();
    loadSampleChat();
});
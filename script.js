// DOM加载完成后执行
 document.addEventListener('DOMContentLoaded', function() {
    // 平滑滚动功能
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 表单提交处理
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 简单的表单验证
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            if (name.trim() === '' || email.trim() === '' || message.trim() === '') {
                alert('请填写所有必填字段');
                return;
            }
            
            // 模拟表单提交
            const submitBtn = contactForm.querySelector('.btn');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = '发送中...';
            submitBtn.disabled = true;
            
            setTimeout(function() {
                // 重置表单
                contactForm.reset();
                submitBtn.textContent = '发送成功！';
                
                setTimeout(function() {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 2000);
            }, 1500);
        });
    }

    // 导航栏滚动效果
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(44, 62, 80, 0.95)';
            header.style.padding = '0.8rem 0';
        } else {
            header.style.backgroundColor = '#2c3e50';
            header.style.padding = '1rem 0';
        }
    });

    // 服务卡片动画效果
    const serviceItems = document.querySelectorAll('.service-item');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    serviceItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });

    // 工具搜索功能
    const toolSearch = document.getElementById('toolSearch');
    const searchBtn = document.getElementById('searchBtn');
    const clearSearch = document.getElementById('clearSearch');
    const toolCategories = document.querySelectorAll('.tool-category');
    const toolItems = document.querySelectorAll('.tool-item');
    
    // 搜索函数
    function searchTools() {
        const searchTerm = toolSearch.value.toLowerCase().trim();
        
        // 如果搜索词为空，显示所有分类和工具
        if (searchTerm === '') {
            toolCategories.forEach(category => {
                category.style.display = 'block';
            });
            toolItems.forEach(item => {
                item.style.display = 'block';
            });
            return;
        }
        
        // 遍历每个分类
        toolCategories.forEach(category => {
            const categoryName = category.querySelector('h3').textContent.toLowerCase();
            const categoryTools = category.querySelectorAll('.tool-item');
            let hasVisibleTools = false;
            
            // 遍历分类下的每个工具
            categoryTools.forEach(tool => {
                const toolName = tool.querySelector('h4').textContent.toLowerCase();
                const toolDesc = tool.querySelector('p').textContent.toLowerCase();
                
                // 检查工具名称或描述是否包含搜索词
                if (toolName.includes(searchTerm) || toolDesc.includes(searchTerm) || categoryName.includes(searchTerm)) {
                    tool.style.display = 'block';
                    hasVisibleTools = true;
                } else {
                    tool.style.display = 'none';
                }
            });
            
            // 只显示包含匹配工具的分类
            category.style.display = hasVisibleTools ? 'block' : 'none';
        });
    }
    
    // 搜索按钮点击事件
    searchBtn.addEventListener('click', searchTools);
    
    // 输入框实时搜索
    toolSearch.addEventListener('input', searchTools);
    
    // 回车键搜索
    toolSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchTools();
        }
    });
    
    // 清除搜索
    clearSearch.addEventListener('click', function() {
        toolSearch.value = '';
        searchTools();
    });

    // 添加页面加载动画
    const body = document.body;
    body.style.opacity = '0';
    body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(function() {
        body.style.opacity = '1';
    }, 100);
});
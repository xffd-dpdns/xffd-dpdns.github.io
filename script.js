// 全局变量
let selectedElement = null;
let componentId = 0;

// 组件默认内容
const componentDefaults = {
    // 基础容器
    div: '<div>容器</div>',
    span: '<span>行内容器</span>',
    
    // 标题元素
    h1: '<h1>标题1</h1>',
    h2: '<h2>标题2</h2>',
    h3: '<h3>标题3</h3>',
    h4: '<h4>标题4</h4>',
    h5: '<h5>标题5</h5>',
    h6: '<h6>标题6</h6>',
    
    // 文本格式化
    p: '<p>这是一段文本</p>',
    strong: '<strong>加粗文本</strong>',
    em: '<em>斜体文本</em>',
    code: '<code>代码</code>',
    u: '<u>下划线文本</u>',
    s: '<s>删除线文本</s>',
    
    // 语义化容器
    section: '<section>区块内容</section>',
    article: '<article>文章内容</article>',
    header: '<header>页头内容</header>',
    footer: '<footer>页脚内容</footer>',
    nav: '<nav>导航内容</nav>',
    aside: '<aside>侧边栏内容</aside>',
    main: '<main>主内容</main>',
    
    // 列表元素
    ul: '<ul><li>列表项1</li><li>列表项2</li></ul>',
    ol: '<ol><li>列表项1</li><li>列表项2</li></ol>',
    li: '<li>列表项</li>',
    
    // 表格元素
    table: '<table border="1"><thead><tr><th>表头1</th><th>表头2</th></tr></thead><tbody><tr><td>内容1</td><td>内容2</td></tr></tbody></table>',
    tr: '<tr><td>单元格1</td><td>单元格2</td></tr>',
    td: '<td>单元格</td>',
    th: '<th>表头单元格</th>',
    
    // 表单元素
    form: '<form>表单内容</form>',
    button: '<button>按钮</button>',
    input: '<input type="text" placeholder="输入框">',
    textarea: '<textarea placeholder="文本域"></textarea>',
    select: '<select><option value="1">选项1</option><option value="2">选项2</option></select>',
    option: '<option value="">选项</option>',
    label: '<label>标签</label>',
    checkbox: '<input type="checkbox"> 复选框',
    radio: '<input type="radio" name="radio"> 单选框',
    
    // 多媒体元素
    img: '<img src="https://via.placeholder.com/150" alt="图片">',
    audio: '<audio controls src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"></audio>',
    video: '<video controls width="320" height="240" src="https://www.w3schools.com/html/mov_bbb.mp4"> </video>',
    iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
    
    // 语义化元素
    details: '<details><summary>详情标题</summary><p>详情内容</p></details>',
    summary: '<summary>摘要</summary>',
    progress: '<progress value="50" max="100"></progress>',
    meter: '<meter value="2" min="0" max="10">2 out of 10</meter>',
    
    // 链接元素
    a: '<a href="#">链接</a>'
};

// 空的updatePreview函数，保持兼容性
function updatePreview() {
    // 之前的实时预览功能已移除，此函数保持兼容性
    console.log('updatePreview called');
}

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeDragAndDrop();
    initializeEventListeners();
    initializeCodeEditors();
});

// 初始化拖拽功能
function initializeDragAndDrop() {
    const components = document.querySelectorAll('.component');
    const canvas = document.getElementById('canvas');
    
    // 可嵌套的容器组件类型
    const containerTypes = ['div', 'span', 'section', 'article', 'header', 'footer', 'nav', 'aside', 'main', 'ul', 'ol', 'table', 'form', 'tr'];
    
    // 拖拽开始事件
    components.forEach(component => {
        component.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.dataset.type);
            e.dataTransfer.setData('source', 'library');
            this.classList.add('dragging');
        });
        
        component.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
    });
    
    // 画布拖放事件
    canvas.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    canvas.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
    });
    
    canvas.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        const componentType = e.dataTransfer.getData('text/plain');
        const source = e.dataTransfer.getData('source');
        
        if (source === 'library') {
            addComponentToCanvas(componentType);
        } else if (source === 'canvas') {
            handleCanvasDrop(e, componentType);
        }
    });
    
    // 为画布上的组件添加拖放事件
    document.addEventListener('dragover', function(e) {
        const targetComponent = e.target.closest('.canvas-component');
        if (targetComponent && containerTypes.includes(targetComponent.dataset.type)) {
            e.preventDefault();
            targetComponent.classList.add('drag-over-nested');
        }
    });
    
    document.addEventListener('dragleave', function(e) {
        const targetComponent = e.target.closest('.canvas-component');
        if (targetComponent) {
            targetComponent.classList.remove('drag-over-nested');
        }
    });
    
    document.addEventListener('drop', function(e) {
        const targetComponent = e.target.closest('.canvas-component');
        if (targetComponent) {
            targetComponent.classList.remove('drag-over-nested');
        }
    });
}

// 添加组件到画布
function addComponentToCanvas(type, parentComponent = null) {
    const canvas = document.getElementById('canvas');
    const canvasHint = canvas.querySelector('.canvas-hint');
    
    // 如果有提示文本，移除它
    if (canvasHint) {
        canvasHint.remove();
    }
    
    // 创建新组件
    const componentId = generateId();
    const component = document.createElement('div');
    component.className = 'canvas-component';
    component.dataset.id = componentId;
    component.dataset.type = type;
    component.innerHTML = componentDefaults[type];
    
    // 添加选中样式和删除按钮
    component.innerHTML += '<div class="component-controls"><button class="delete-btn" title="删除">&times;</button><button class="duplicate-btn" title="复制">+</button></div>';
    
    // 添加到画布或父组件
    if (parentComponent) {
        parentComponent.appendChild(component);
    } else {
        canvas.appendChild(component);
    }
    
    // 添加事件监听
    addComponentEventListeners(component);
    
    // 选中新添加的组件
    selectElement(component);
    
    // 更新预览
    updatePreview();
}

// 生成唯一ID
function generateId() {
    return `component-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// 添加组件事件监听
function addComponentEventListeners(component) {
    // 点击选中组件
    component.addEventListener('click', function(e) {
        if (!e.target.closest('.component-controls')) {
            selectElement(this);
        }
    });
    
    // 拖拽开始事件
    component.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', this.dataset.type);
        e.dataTransfer.setData('source', 'canvas');
        e.dataTransfer.setData('componentId', this.dataset.id);
        this.classList.add('dragging');
    });
    
    // 拖拽结束事件
    component.addEventListener('dragend', function() {
        this.classList.remove('dragging');
    });
    
    // 拖放事件
    component.addEventListener('dragover', function(e) {
        const containerTypes = ['div', 'span', 'section', 'article', 'header', 'footer', 'nav', 'aside', 'main', 'ul', 'ol', 'table', 'form', 'tr'];
        if (containerTypes.includes(this.dataset.type)) {
            e.preventDefault();
            this.classList.add('drag-over-nested');
        }
    });
    
    component.addEventListener('dragleave', function(e) {
        this.classList.remove('drag-over-nested');
    });
    
    component.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over-nested');
        
        const componentType = e.dataTransfer.getData('text/plain');
        const source = e.dataTransfer.getData('source');
        const componentId = e.dataTransfer.getData('componentId');
        
        if (source === 'library') {
            // 从组件库拖入，创建新组件
            addComponentToCanvas(componentType, this);
        } else if (source === 'canvas') {
            // 从画布拖入，移动组件
            const draggedComponent = document.querySelector(`[data-id="${componentId}"]`);
            if (draggedComponent && draggedComponent !== this && !this.contains(draggedComponent)) {
                this.appendChild(draggedComponent);
                updatePreview();
            }
        }
    });
    
    // 删除按钮
    const deleteBtn = component.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function() {
        component.remove();
        clearProperties();
        updatePreview();
        
        // 如果画布为空，显示提示
        const canvas = document.getElementById('canvas');
        if (canvas.children.length === 0) {
            canvas.innerHTML = '<div class="canvas-hint">将左侧组件拖拽到此处</div>';
        }
    });
    
    // 复制按钮
    const duplicateBtn = component.querySelector('.duplicate-btn');
    duplicateBtn.addEventListener('click', function() {
        const newComponent = component.cloneNode(true);
        newComponent.dataset.id = generateId();
        component.parentNode.insertBefore(newComponent, component.nextSibling);
        addComponentEventListeners(newComponent);
        selectElement(newComponent);
        updatePreview();
    });
}

// 选中元素
function selectElement(element) {
    // 移除之前的选中状态
    const previousSelected = document.querySelector('.canvas-component.selected');
    if (previousSelected) {
        previousSelected.classList.remove('selected');
    }
    
    // 添加当前选中状态
    element.classList.add('selected');
    selectedElement = element;
    
    // 显示属性编辑
    showProperties(element);
}

// 显示属性编辑
function showProperties(element) {
    const propertiesContainer = document.getElementById('properties');
    const componentType = element.dataset.type;
    const content = getComponentContent(element);
    const classes = element.className.replace('canvas-component selected', '').trim();
    const style = element.style.cssText;
    const id = element.id;
    
    // 获取内部元素
    let innerElement = element.firstElementChild;
    if (!innerElement) {
        innerElement = element;
    }
    
    // 基础属性HTML
    let propertiesHTML = `
        <div class="property-group">
            <label>组件类型: ${componentType}</label>
        </div>
        <div class="property-group">
            <label for="content">内容</label>
            <textarea id="content" rows="3">${content}</textarea>
        </div>
        <div class="property-group">
            <label for="class">CSS类</label>
            <input type="text" id="class" value="${classes}">
        </div>
        <div class="property-group">
            <label for="style">样式</label>
            <textarea id="style" rows="4">${style}</textarea>
        </div>
        <div class="property-group">
            <label for="id">ID</label>
            <input type="text" id="id" value="${id}">
        </div>
        <div class="property-group">
            <label for="title">标题提示</label>
            <input type="text" id="title" value="${element.title}">
        </div>
        <div class="property-group">
            <label for="lang">语言属性</label>
            <input type="text" id="lang" value="${element.lang || ''}">
        </div>
        <div class="property-group">
            <label for="dir">文本方向</label>
            <select id="dir">
                <option value="" ${element.dir === '' ? 'selected' : ''}>默认</option>
                <option value="ltr" ${element.dir === 'ltr' ? 'selected' : ''}>从左到右</option>
                <option value="rtl" ${element.dir === 'rtl' ? 'selected' : ''}>从右到左</option>
                <option value="auto" ${element.dir === 'auto' ? 'selected' : ''}>自动</option>
            </select>
        </div>
    `;
    
    // 根据组件类型添加特定属性
    switch(componentType) {
        // 链接元素
        case 'a':
            propertiesHTML += `
                <div class="property-group">
                    <label for="href">链接地址</label>
                    <input type="text" id="href" value="${innerElement.href || '#'}">
                </div>
                <div class="property-group">
                    <label for="target">目标</label>
                    <select id="target">
                        <option value="" ${innerElement.target === '' ? 'selected' : ''}>默认</option>
                        <option value="_blank" ${innerElement.target === '_blank' ? 'selected' : ''}>新窗口</option>
                        <option value="_self" ${innerElement.target === '_self' ? 'selected' : ''}>当前窗口</option>
                        <option value="_parent" ${innerElement.target === '_parent' ? 'selected' : ''}>父窗口</option>
                        <option value="_top" ${innerElement.target === '_top' ? 'selected' : ''}>顶级窗口</option>
                    </select>
                </div>
            `;
            break;
            
        // 图片元素
        case 'img':
            propertiesHTML += `
                <div class="property-group">
                    <label for="src">图片地址</label>
                    <input type="text" id="src" value="${innerElement.src}">
                </div>
                <div class="property-group">
                    <label for="alt">替代文本</label>
                    <input type="text" id="alt" value="${innerElement.alt}">
                </div>
                <div class="property-group">
                    <label for="width">宽度</label>
                    <input type="number" id="width" value="${innerElement.width}">
                </div>
                <div class="property-group">
                    <label for="height">高度</label>
                    <input type="number" id="height" value="${innerElement.height}">
                </div>
            `;
            break;
            
        // 输入框元素
        case 'input':
        case 'checkbox':
        case 'radio':
            const inputType = componentType === 'checkbox' ? 'checkbox' : 
                             componentType === 'radio' ? 'radio' : 
                             innerElement.type || 'text';
            propertiesHTML += `
                <div class="property-group">
                    <label for="input-type">类型</label>
                    <select id="input-type">
                        <option value="text" ${inputType === 'text' ? 'selected' : ''}>文本</option>
                        <option value="number" ${inputType === 'number' ? 'selected' : ''}>数字</option>
                        <option value="email" ${inputType === 'email' ? 'selected' : ''}>邮箱</option>
                        <option value="password" ${inputType === 'password' ? 'selected' : ''}>密码</option>
                        <option value="checkbox" ${inputType === 'checkbox' ? 'selected' : ''}>复选框</option>
                        <option value="radio" ${inputType === 'radio' ? 'selected' : ''}>单选框</option>
                        <option value="submit" ${inputType === 'submit' ? 'selected' : ''}>提交</option>
                        <option value="reset" ${inputType === 'reset' ? 'selected' : ''}>重置</option>
                        <option value="button" ${inputType === 'button' ? 'selected' : ''}>按钮</option>
                    </select>
                </div>
                <div class="property-group">
                    <label for="placeholder">占位符</label>
                    <input type="text" id="placeholder" value="${innerElement.placeholder || ''}">
                </div>
                <div class="property-group">
                    <label for="value">值</label>
                    <input type="text" id="value" value="${innerElement.value || ''}">
                </div>
                <div class="property-group">
                    <label for="required">必填</label>
                    <input type="checkbox" id="required" ${innerElement.required ? 'checked' : ''}>
                </div>
                <div class="property-group">
                    <label for="disabled">禁用</label>
                    <input type="checkbox" id="disabled" ${innerElement.disabled ? 'checked' : ''}>
                </div>
                <div class="property-group">
                    <label for="checked">选中</label>
                    <input type="checkbox" id="checked" ${innerElement.checked ? 'checked' : ''}>
                </div>
            `;
            break;
            
        // 按钮元素
        case 'button':
            propertiesHTML += `
                <div class="property-group">
                    <label for="button-type">类型</label>
                    <select id="button-type">
                        <option value="button" ${innerElement.type === 'button' ? 'selected' : ''}>按钮</option>
                        <option value="submit" ${innerElement.type === 'submit' ? 'selected' : ''}>提交</option>
                        <option value="reset" ${innerElement.type === 'reset' ? 'selected' : ''}>重置</option>
                    </select>
                </div>
                <div class="property-group">
                    <label for="button-disabled">禁用</label>
                    <input type="checkbox" id="button-disabled" ${innerElement.disabled ? 'checked' : ''}>
                </div>
            `;
            break;
            
        // 多媒体元素
        case 'audio':
        case 'video':
            propertiesHTML += `
                <div class="property-group">
                    <label for="media-src">源地址</label>
                    <input type="text" id="media-src" value="${innerElement.src}">
                </div>
                <div class="property-group">
                    <label for="controls">显示控制器</label>
                    <input type="checkbox" id="controls" ${innerElement.hasAttribute('controls') ? 'checked' : ''}>
                </div>
                <div class="property-group">
                    <label for="autoplay">自动播放</label>
                    <input type="checkbox" id="autoplay" ${innerElement.hasAttribute('autoplay') ? 'checked' : ''}>
                </div>
                <div class="property-group">
                    <label for="loop">循环播放</label>
                    <input type="checkbox" id="loop" ${innerElement.hasAttribute('loop') ? 'checked' : ''}>
                </div>
                <div class="property-group">
                    <label for="media-width">宽度</label>
                    <input type="number" id="media-width" value="${innerElement.width}">
                </div>
                <div class="property-group">
                    <label for="media-height">高度</label>
                    <input type="number" id="media-height" value="${innerElement.height}">
                </div>
            `;
            break;
            
        // iframe元素
        case 'iframe':
            propertiesHTML += `
                <div class="property-group">
                    <label for="iframe-src">源地址</label>
                    <input type="text" id="iframe-src" value="${innerElement.src}">
                </div>
                <div class="property-group">
                    <label for="iframe-width">宽度</label>
                    <input type="number" id="iframe-width" value="${innerElement.width}">
                </div>
                <div class="property-group">
                    <label for="iframe-height">高度</label>
                    <input type="number" id="iframe-height" value="${innerElement.height}">
                </div>
                <div class="property-group">
                    <label for="frameborder">边框</label>
                    <input type="number" id="frameborder" value="${innerElement.frameborder}">
                </div>
            `;
            break;
    }
    
    // 设置属性HTML
    propertiesContainer.innerHTML = propertiesHTML;
    
    // 添加属性变更事件监听
    
    // 内容变更
    const contentInput = document.getElementById('content');
    if (contentInput) {
        contentInput.addEventListener('input', function() {
            updateComponentContent(element, this.value);
        });
    }
    
    // 类名变更
    const classInput = document.getElementById('class');
    if (classInput) {
        classInput.addEventListener('input', function() {
            element.className = `canvas-component ${this.value}${element.classList.contains('selected') ? ' selected' : ''}`;
            updatePreview();
        });
    }
    
    // 样式变更
    const styleInput = document.getElementById('style');
    if (styleInput) {
        styleInput.addEventListener('input', function() {
            element.style.cssText = this.value;
            updatePreview();
        });
    }
    
    // ID变更
    const idInput = document.getElementById('id');
    if (idInput) {
        idInput.addEventListener('input', function() {
            element.id = this.value;
            updatePreview();
        });
    }
    
    // 标题变更
    const titleInput = document.getElementById('title');
    if (titleInput) {
        titleInput.addEventListener('input', function() {
            element.title = this.value;
            updatePreview();
        });
    }
    
    // 语言属性变更
    const langInput = document.getElementById('lang');
    if (langInput) {
        langInput.addEventListener('input', function() {
            element.lang = this.value;
            updatePreview();
        });
    }
    
    // 文本方向变更
    const dirInput = document.getElementById('dir');
    if (dirInput) {
        dirInput.addEventListener('change', function() {
            element.dir = this.value;
            updatePreview();
        });
    }
    
    // 链接属性
    const hrefInput = document.getElementById('href');
    const targetInput = document.getElementById('target');
    if (hrefInput && targetInput) {
        hrefInput.addEventListener('input', function() {
            innerElement.href = this.value;
            updatePreview();
        });
        
        targetInput.addEventListener('change', function() {
            innerElement.target = this.value;
            updatePreview();
        });
    }
    
    // 图片属性
    const srcInput = document.getElementById('src');
    const altInput = document.getElementById('alt');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    if (srcInput && altInput) {
        srcInput.addEventListener('input', function() {
            innerElement.src = this.value;
            updatePreview();
        });
        
        altInput.addEventListener('input', function() {
            innerElement.alt = this.value;
            updatePreview();
        });
        
        if (widthInput && heightInput) {
            widthInput.addEventListener('input', function() {
                innerElement.width = this.value;
                updatePreview();
            });
            
            heightInput.addEventListener('input', function() {
                innerElement.height = this.value;
                updatePreview();
            });
        }
    }
    
    // 输入框属性
    const inputTypeInput = document.getElementById('input-type');
    const placeholderInput = document.getElementById('placeholder');
    const valueInput = document.getElementById('value');
    const requiredInput = document.getElementById('required');
    const disabledInput = document.getElementById('disabled');
    const checkedInput = document.getElementById('checked');
    if (inputTypeInput) {
        inputTypeInput.addEventListener('change', function() {
            innerElement.type = this.value;
            updatePreview();
        });
    }
    
    if (placeholderInput) {
        placeholderInput.addEventListener('input', function() {
            innerElement.placeholder = this.value;
            updatePreview();
        });
    }
    
    if (valueInput) {
        valueInput.addEventListener('input', function() {
            innerElement.value = this.value;
            updatePreview();
        });
    }
    
    if (requiredInput) {
        requiredInput.addEventListener('change', function() {
            if (this.checked) {
                innerElement.required = true;
            } else {
                innerElement.removeAttribute('required');
            }
            updatePreview();
        });
    }
    
    if (disabledInput) {
        disabledInput.addEventListener('change', function() {
            innerElement.disabled = this.checked;
            updatePreview();
        });
    }
    
    if (checkedInput) {
        checkedInput.addEventListener('change', function() {
            innerElement.checked = this.checked;
            updatePreview();
        });
    }
    
    // 按钮属性
    const buttonTypeInput = document.getElementById('button-type');
    const buttonDisabledInput = document.getElementById('button-disabled');
    if (buttonTypeInput) {
        buttonTypeInput.addEventListener('change', function() {
            innerElement.type = this.value;
            updatePreview();
        });
    }
    
    if (buttonDisabledInput) {
        buttonDisabledInput.addEventListener('change', function() {
            innerElement.disabled = this.checked;
            updatePreview();
        });
    }
    
    // 媒体属性
    const mediaSrcInput = document.getElementById('media-src');
    const controlsInput = document.getElementById('controls');
    const autoplayInput = document.getElementById('autoplay');
    const loopInput = document.getElementById('loop');
    const mediaWidthInput = document.getElementById('media-width');
    const mediaHeightInput = document.getElementById('media-height');
    if (mediaSrcInput) {
        mediaSrcInput.addEventListener('input', function() {
            innerElement.src = this.value;
            updatePreview();
        });
    }
    
    if (controlsInput) {
        controlsInput.addEventListener('change', function() {
            if (this.checked) {
                innerElement.setAttribute('controls', 'controls');
            } else {
                innerElement.removeAttribute('controls');
            }
            updatePreview();
        });
    }
    
    if (autoplayInput) {
        autoplayInput.addEventListener('change', function() {
            if (this.checked) {
                innerElement.setAttribute('autoplay', 'autoplay');
            } else {
                innerElement.removeAttribute('autoplay');
            }
            updatePreview();
        });
    }
    
    if (loopInput) {
        loopInput.addEventListener('change', function() {
            if (this.checked) {
                innerElement.setAttribute('loop', 'loop');
            } else {
                innerElement.removeAttribute('loop');
            }
            updatePreview();
        });
    }
    
    if (mediaWidthInput) {
        mediaWidthInput.addEventListener('input', function() {
            innerElement.width = this.value;
            updatePreview();
        });
    }
    
    if (mediaHeightInput) {
        mediaHeightInput.addEventListener('input', function() {
            innerElement.height = this.value;
            updatePreview();
        });
    }
    
    // iframe属性
    const iframeSrcInput = document.getElementById('iframe-src');
    const iframeWidthInput = document.getElementById('iframe-width');
    const iframeHeightInput = document.getElementById('iframe-height');
    const frameborderInput = document.getElementById('frameborder');
    if (iframeSrcInput) {
        iframeSrcInput.addEventListener('input', function() {
            innerElement.src = this.value;
            updatePreview();
        });
    }
    
    if (iframeWidthInput) {
        iframeWidthInput.addEventListener('input', function() {
            innerElement.width = this.value;
            updatePreview();
        });
    }
    
    if (iframeHeightInput) {
        iframeHeightInput.addEventListener('input', function() {
            innerElement.height = this.value;
            updatePreview();
        });
    }
    
    if (frameborderInput) {
        frameborderInput.addEventListener('input', function() {
            innerElement.frameborder = this.value;
            updatePreview();
        });
    }
}

// 获取组件内容
function getComponentContent(element) {
    const controls = element.querySelector('.component-controls');
    if (controls) {
        const clone = element.cloneNode(true);
        clone.querySelector('.component-controls').remove();
        return clone.innerHTML;
    }
    return element.innerHTML;
}

// 更新组件内容
function updateComponentContent(element, content) {
    const controls = element.querySelector('.component-controls');
    if (controls) {
        element.innerHTML = content + controls.outerHTML;
    } else {
        element.innerHTML = content;
    }
    updatePreview();
}

// 清空属性编辑
function clearProperties() {
    const propertiesContainer = document.getElementById('properties');
    propertiesContainer.innerHTML = '<div class="properties-hint">请选择一个组件进行编辑</div>';
    selectedElement = null;
}

// 初始化事件监听器
function initializeEventListeners() {
    // 导出按钮
    document.getElementById('export-btn').addEventListener('click', exportCode);
    
    // 清空画布按钮
    document.getElementById('clear-btn').addEventListener('click', clearCanvas);
    
    // 头部属性编辑按钮
    document.getElementById('header-btn').addEventListener('click', toggleHeaderEditor);
    
    // 页面标题变更
    document.getElementById('page-title').addEventListener('input', function() {
        // 更新页面标题
        document.title = this.value;
    });
    
    // 调试日志
    console.log('Initializing event listeners...');
    
    // 文件上传功能
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    
    console.log('File input element:', fileInput);
    console.log('Upload button element:', uploadBtn);
    
    // 点击上传按钮触发文件选择
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Upload button clicked, triggering file input...');
            fileInput.click();
        });
        
        // 文件选择事件
        fileInput.addEventListener('change', function(e) {
            console.log('File selected:', e.target.files[0]);
            handleFileUpload(e.target.files[0]);
        });
    } else {
        console.error('File input or upload button not found!');
    }
}

// 切换头部属性编辑区域显示/隐藏
function toggleHeaderEditor() {
    const headerEditor = document.getElementById('header-editor');
    const isVisible = headerEditor.style.display !== 'none';
    
    if (isVisible) {
        headerEditor.style.display = 'none';
    } else {
        headerEditor.style.display = 'flex';
    }
}

// 处理文件上传
function handleFileUpload(file) {
    console.log('handleFileUpload called with file:', file);
    
    if (!file) {
        console.log('No file provided');
        return;
    }
    
    // 检查文件类型
    console.log('File type:', file.type);
    console.log('File name:', file.name);
    
    if (file.type !== 'text/html' && !file.name.endsWith('.html')) {
        alert('请上传HTML文件！');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        console.log('File read successfully, size:', e.target.result.length);
        const htmlContent = e.target.result;
        parseHTML(htmlContent);
    };
    
    reader.onerror = function() {
        console.error('File read error:', reader.error);
        alert('文件读取失败！');
    };
    
    reader.onprogress = function(e) {
        if (e.lengthComputable) {
            const percentLoaded = Math.round((e.loaded / e.total) * 100);
            console.log('File loading progress:', percentLoaded + '%');
        }
    };
    
    console.log('Starting file read...');
    reader.readAsText(file, 'UTF-8');
}

// 解析HTML内容
function parseHTML(htmlContent) {
    console.log('parseHTML called with content length:', htmlContent.length);
    
    try {
        // 创建临时DOM元素解析HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        console.log('HTML parsed successfully');
        
        // 提取头部信息
        console.log('Extracting header info...');
        extractHeaderInfo(tempDiv);
        
        // 提取CSS
        console.log('Extracting CSS...');
        const css = extractCSS(tempDiv);
        console.log('CSS extracted, length:', css.length);
        document.getElementById('global-css').value = css;
        
        // 提取JavaScript
        console.log('Extracting JavaScript...');
        const js = extractJS(tempDiv);
        console.log('JavaScript extracted, length:', js.length);
        document.getElementById('global-js').value = js;
        
        // 提取body内容
        console.log('Extracting body content...');
        const bodyContent = extractBodyContent(htmlContent);
        console.log('Body content extracted, length:', bodyContent.length);
        
        // 渲染到画布
        console.log('Rendering to canvas...');
        renderToCanvas(bodyContent);
        
        // 分析模块
        console.log('Analyzing modules...');
        analyzeModules(css, js);
        
        console.log('parseHTML completed successfully');
    } catch (error) {
        console.error('Error in parseHTML:', error);
        alert('HTML解析失败！错误信息：' + error.message);
    }
}

// 提取头部信息
function extractHeaderInfo(tempDiv) {
    // 提取页面标题
    const title = tempDiv.querySelector('title')?.textContent || '图形化HTML开发工具';
    document.getElementById('page-title').value = title;
    document.title = title;
    
    // 提取元标签
    const metaTags = tempDiv.querySelectorAll('meta');
    let metaHTML = '';
    metaTags.forEach(tag => {
        metaHTML += tag.outerHTML + '\n';
    });
    
    // 提取其他头部标签
    const linkTags = tempDiv.querySelectorAll('link[rel="stylesheet"]');
    linkTags.forEach(tag => {
        metaHTML += tag.outerHTML + '\n';
    });
    
    document.getElementById('meta-tags').value = metaHTML.trim();
}

// 提取CSS
function extractCSS(tempDiv) {
    let css = '';
    
    // 提取内部CSS
    const styleTags = tempDiv.querySelectorAll('style');
    styleTags.forEach(tag => {
        css += tag.textContent + '\n';
    });
    
    return css.trim();
}

// 提取JavaScript
function extractJS(tempDiv) {
    let js = '';
    
    // 提取内部JS
    const scriptTags = tempDiv.querySelectorAll('script');
    scriptTags.forEach(tag => {
        if (!tag.src) {
            js += tag.textContent + '\n';
        }
    });
    
    return js.trim();
}

// 提取body内容
function extractBodyContent(htmlContent) {
    console.log('extractBodyContent called');
    
    // 尝试多种方式提取body内容
    
    // 方式1：使用正则表达式
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
        console.log('Body content extracted using regex');
        return bodyMatch[1];
    }
    
    // 方式2：使用DOM解析
    try {
        const tempDoc = document.createElement('html');
        tempDoc.innerHTML = htmlContent;
        const body = tempDoc.querySelector('body');
        if (body) {
            console.log('Body content extracted using DOM parsing');
            return body.innerHTML;
        }
    } catch (error) {
        console.error('Error in DOM parsing for body extraction:', error);
    }
    
    console.log('No body content found, returning empty string');
    return '';
}

// 将内容渲染到画布
function renderToCanvas(content) {
    const canvas = document.getElementById('canvas');
    
    // 清空画布
    canvas.innerHTML = '';
    
    // 检查是否为空
    if (!content.trim()) {
        canvas.innerHTML = '<div class="canvas-hint">将左侧组件拖拽到此处</div>';
        return;
    }
    
    // 创建临时元素解析内容
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // 获取所有子元素
    const elements = tempDiv.children;
    
    // 遍历元素并添加到画布
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const componentType = element.tagName.toLowerCase();
        
        // 检查是否在支持的组件类型中
        if (componentDefaults[componentType]) {
            // 支持的组件类型，直接添加
            addComponentToCanvasWithContent(componentType, element.outerHTML);
        } else {
            // 不支持的组件类型，使用手动编写模式
            addComponentToCanvasWithContent('div', '<div class="manual-component"><span class="manual-label">✏️ 手动编写</span>' + element.outerHTML + '</div>');
        }
    }
}

// 添加组件到画布（带自定义内容）
function addComponentToCanvasWithContent(type, content) {
    console.log('addComponentToCanvasWithContent called with type:', type);
    
    const canvas = document.getElementById('canvas');
    const canvasHint = canvas.querySelector('.canvas-hint');
    
    // 如果有提示文本，移除它
    if (canvasHint) {
        canvasHint.remove();
    }
    
    // 创建新组件
    const componentId = generateId();
    const component = document.createElement('div');
    component.className = 'canvas-component';
    component.dataset.id = componentId;
    component.dataset.type = type;
    component.innerHTML = content;
    
    // 添加选中样式和删除按钮
    component.innerHTML += '<div class="component-controls"><button class="delete-btn" title="删除">&times;</button><button class="duplicate-btn" title="复制">+</button></div>';
    
    // 添加到画布
    canvas.appendChild(component);
    
    // 添加事件监听
    addComponentEventListeners(component);
    
    console.log('Component added to canvas successfully');
}

// 分析模块
function analyzeModules(css, js) {
    // 简单的模块分析
    const modules = {
        cssModules: [],
        jsModules: [],
        unsupportedModules: []
    };
    
    // CSS模块分析
    const cssLines = css.split('\n');
    cssLines.forEach((line, index) => {
        if (line.trim().startsWith('/*') && line.trim().endsWith('*/')) {
            modules.cssModules.push({
                type: 'css',
                name: line.trim().slice(2, -2).trim(),
                startLine: index + 1
            });
        }
    });
    
    // JS模块分析
    const jsLines = js.split('\n');
    jsLines.forEach((line, index) => {
        if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
            modules.jsModules.push({
                type: 'js',
                name: line.trim().replace(/^\/[/*]/, '').trim(),
                startLine: index + 1
            });
        }
    });
    
    // 检查是否有外部依赖
    if (js.includes('require(') || js.includes('import ')) {
        modules.unsupportedModules.push({
            type: 'external',
            name: '外部依赖',
            reason: '检测到require或import语句，不支持外部依赖自动解析'
        });
    }
    
    // 检查是否有复杂框架代码
    if (js.includes('React') || js.includes('Vue') || js.includes('Angular')) {
        modules.unsupportedModules.push({
            type: 'framework',
            name: '前端框架',
            reason: '检测到React/Vue/Angular等框架代码，不支持自动解析'
        });
    }
    
    // 显示分析结果
    showModuleAnalysis(modules);
}

// 显示模块分析结果
function showModuleAnalysis(modules) {
    // 创建模态框显示分析结果
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background-color: white;
        padding: 24px;
        border-radius: 8px;
        width: 90%;
        max-width: 600px;
        max-height: 80%;
        overflow-y: auto;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    `;
    
    let contentHTML = '<h2 style="margin-bottom: 20px;">模块分析结果</h2>';
    
    // CSS模块
    if (modules.cssModules.length > 0) {
        contentHTML += '<h3 style="margin: 16px 0 8px 0;">CSS模块</h3>';
        contentHTML += '<ul style="margin: 0 0 16px 0; padding-left: 20px;">';
        modules.cssModules.forEach(module => {
            contentHTML += `<li>📄 ${module.name} (行 ${module.startLine})</li>`;
        });
        contentHTML += '</ul>';
    }
    
    // JS模块
    if (modules.jsModules.length > 0) {
        contentHTML += '<h3 style="margin: 16px 0 8px 0;">JavaScript模块</h3>';
        contentHTML += '<ul style="margin: 0 0 16px 0; padding-left: 20px;">';
        modules.jsModules.forEach(module => {
            contentHTML += `<li>📄 ${module.name} (行 ${module.startLine})</li>`;
        });
        contentHTML += '</ul>';
        
        contentHTML += '<button onclick="this.parentElement.parentElement.remove();" style="padding: 10px 20px; background-color: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; margin-top: 16px;">关闭</button>';
    }
    
    // 不支持的模块
    if (modules.unsupportedModules.length > 0) {
        contentHTML += '<h3 style="margin: 16px 0 8px 0; color: #ef4444;">不支持的模块</h3>';
        contentHTML += '<ul style="margin: 0 0 16px 0; padding-left: 20px;">';
        modules.unsupportedModules.forEach(module => {
            contentHTML += `<li style="color: #ef4444;">⚠️ ${module.name}: ${module.reason}</li>`;
        });
        contentHTML += '</ul>';
        
        contentHTML += '<div style="margin: 16px 0;\ padding: 12px;\ background-color: #fef2f2;\ border-left: 4px solid #ef4444; border-radius: 4px;">';
        contentHTML += '<strong style="color: #ef4444;">注意：</strong>不支持的模块已转换为手动编写模式，请手动调整代码。';
        contentHTML += '</div>';
    }
    
    modalContent.innerHTML = contentHTML;
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// 初始化代码编辑器
function initializeCodeEditors() {
    const globalCSS = document.getElementById('global-css');
    const globalJS = document.getElementById('global-js');
    
    // 全局CSS变更事件
    if (globalCSS) {
        globalCSS.addEventListener('input', function() {
            updatePreview();
        });
    }
    
    // 全局JS变更事件
    if (globalJS) {
        globalJS.addEventListener('input', function() {
            updatePreview();
        });
    }
}

// 生成HTML
function generateHTML() {
    const canvas = document.getElementById('canvas');
    const components = canvas.querySelectorAll('.canvas-component');
    let html = '';
    
    components.forEach(component => {
        const clone = component.cloneNode(true);
        const controls = clone.querySelector('.component-controls');
        if (controls) {
            controls.remove();
        }
        html += clone.outerHTML;
    });
    
    return html;
}

// 生成CSS
function generateCSS() {
    const globalCSS = document.getElementById('global-css');
    return globalCSS ? globalCSS.value : '';
}

// 生成JS
function generateJS() {
    const globalJS = document.getElementById('global-js');
    return globalJS ? globalJS.value : '';
}

// 导出代码
function exportCode() {
    const html = generateHTML();
    const css = generateCSS();
    const js = generateJS();
    
    // 获取头部属性
    const pageTitle = document.getElementById('page-title').value || '导出的页面';
    const metaTags = document.getElementById('meta-tags').value || '';
    
    const fullCode = `
<!DOCTYPE html>
<html>
<head>
${metaTags}
    <title>${pageTitle}</title>
    <style>
${css}
    </style>
</head>
<body>
${html}
    <script>
${js}
    </script>
</body>
</html>
    `;
    
    // 创建下载链接
    const blob = new Blob([fullCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 清空画布
function clearCanvas() {
    const canvas = document.getElementById('canvas');
    canvas.innerHTML = '<div class="canvas-hint">将左侧组件拖拽到此处</div>';
    clearProperties();
    updatePreview();
}

// 生成唯一ID
function generateId() {
    return `component-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
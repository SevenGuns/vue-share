// 模板编译
class Compile {
  constructor(el, vm) {
    this.$vm = vm;
    this.$el = document.querySelector(el);
    this.$fragment = this.node2Fragment(this.$el);
    this.compile(this.$fragment);
    this.$el.appendChild(this.$fragment);
  }
  node2Fragment(el) {
    const fragment = document.createDocumentFragment();
    let child;
    while ((child = el.firstChild)) {
      /** 移动节点 */
      fragment.appendChild(child);
    }
    return fragment;
  }
  compile(el) {
    const childNodes = el.childNodes;
    Array.from(childNodes).forEach((node) => {
      if (node.nodeType === 1) {
        this.compileElement(node);
      } else if (this.isText(node)) {
        this.compileText(node);
      }
      /** TODO: children和childNodes区别 */
      if (node.children && node.childNodes.length) {
        this.compile(node);
      }
    });
  }
  compileText(node) {
    const exp = RegExp.$1;
    this.update(node, exp, 'text');
  }
  compileElement(node) {
    const nodeAttrs = node.attributes;
    Array.from(nodeAttrs).forEach((attr) => {
      const attrName = attr.name;
      const exp = attr.value;
      if (attrName.startsWith('@')) {
        const dir = attrName.substr(1);
        if (this.$vm[exp]) {
          node.addEventListener(dir, this.$vm[exp]);
        }
      }
    });
  }
  isText(node) {
    return node.nodeType === 3 && /\{\{(.+)\}\}/.test(node.textContent);
  }
  update(node, exp, dir) {
    const updater = this[`${dir}Updater`];
    if (updater) {
      updater(node, this.$vm[exp]);
    }
    new Watcher(this.$vm, exp, function (value) {
      if (updater) {
        updater(node, value);
      }
    });
  }
  /** 更新文本节点 */
  textUpdater(node, value) {
    node.textContent = value;
  }
}

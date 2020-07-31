class DVue {
  constructor(opts) {
    this.$opts = opts;
    this.$data = opts.data;
    // 代理属性
    this.proxyMethods(opts.methods);
    this.observe(this.$data);
    // 编译模板
    this.$compile = new Compile(opts.el, this);
    // 触发生命周期
    if (opts.created) {
      opts.created.call(this);
    }
  }

  /** 代理methods */
  proxyMethods(methods) {
    Object.keys(methods).forEach((key) => {
      Object.defineProperty(this, key, {
        get() {
          return methods[key].bind(this);
        },
      });
    });
  }

  /** 代理Data */
  proxyData(key) {
    Object.defineProperty(this, key, {
      get() {
        return this.$data[key];
      },
      set(newVal) {
        this.$data[key] = newVal;
      },
    });
  }

  /** 添加响应式 */
  observe(value) {
    if (!value || typeof value !== 'object') return;
    Object.keys(value).forEach((key) => {
      this.defineReactive(value, key, value[key]);
      this.proxyData(key);
    });
  }

  /** 添加响应式 */
  defineReactive(obj, key, value) {
    // 递归设置监听
    this.observe(value);
    const dep = new Dep();
    Object.defineProperty(obj, key, {
      get() {
        if (Dep.target) {
          dep.addDep(Dep.target);
        }
        return value;
      },
      set(newVal) {
        if (newVal !== value) {
          value = newVal;
          dep.notify();
        }
      },
    });
  }
}

class Dep {
  constructor() {
    this.deps = [];
  }
  addDep(watcher) {
    this.deps.push(watcher);
  }
  notify() {
    this.deps.forEach((dep) => dep.update());
  }
}

class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm;
    this.key = key;
    this.cb = cb;
    Dep.target = this;
    this.vm[key];
    Dep.target = null;
  }
  update() {
    this.cb.call(this.vm, this.vm[this.key]);
  }
}

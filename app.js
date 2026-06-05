const staff = {
  name: "林一然",
  role: "高级零售顾问",
  store: "上海静安大悦城 Apple 授权门店",
  storeCode: "SH-JA-019",
  employeeNo: "11005566",
};

const product = {
  name: "iPhone 15 Pro Max 256GB 原色钛金属",
  brand: "Apple",
  category: "智能手机",
  imei1: "356789120438762",
  imei2: "356789120438770",
  sn: "F2LXQ9R7P4KJ",
  listPrice: 9999,
};

const customerProfile = {
  name: "王嘉宁",
  phone: "13800138000",
  idNo: "310101199608182418",
};

const historyStatusMap = {
  all: { label: "今日核销", tone: "blue" },
  pendingPay: { label: "待支付", tone: "orange" },
  pendingUpload: { label: "待上传", tone: "blue" },
  pendingReview: { label: "待审核", tone: "blue" },
  rejected: { label: "已驳回", tone: "red" },
  approved: { label: "已通过", tone: "green" },
};

const historyOrders = [
  {
    id: "HX202606030018",
    status: "rejected",
    customerName: "王嘉宁",
    phone: "13800138000",
    productName: product.name,
    sn: product.sn,
    imei1: product.imei1,
    imei2: product.imei2,
    amount: "8999.10",
    createdAt: "2026-06-03 10:32",
    rejectReason: "激活设备 SN/IMEI 照片反光，IMEI 2 无法识别，请重新拍摄。",
  },
  {
    id: "HX202606030017",
    status: "pendingReview",
    customerName: "陈沐",
    phone: "13688990012",
    productName: "iPhone 15 128GB 蓝色",
    sn: "G7P4KJ92LQ8M",
    imei1: "356789120438701",
    imei2: "356789120438709",
    amount: "5399.10",
    createdAt: "2026-06-03 09:48",
  },
  {
    id: "HX202606030016",
    status: "pendingUpload",
    customerName: "刘子航",
    phone: "13922667788",
    productName: "iPhone 15 Pro 256GB 蓝色钛金属",
    sn: "K9M2Q8V6A1NZ",
    imei1: "356789120438812",
    imei2: "356789120438820",
    amount: "8099.10",
    createdAt: "2026-06-03 09:20",
  },
  {
    id: "HX202606030015",
    status: "pendingPay",
    customerName: "赵一铭",
    phone: "13566778899",
    productName: "iPhone 15 Plus 128GB 粉色",
    sn: "P4KJ7X2C9B6T",
    imei1: "356789120438623",
    imei2: "356789120438631",
    amount: "6299.10",
    createdAt: "2026-06-03 08:55",
  },
  {
    id: "HX202606030014",
    status: "approved",
    customerName: "许言",
    phone: "13777889900",
    productName: "iPhone 15 Pro Max 256GB 原色钛金属",
    sn: "V2NC8D5Q1P0L",
    imei1: "356789120438512",
    imei2: "356789120438520",
    amount: "8999.10",
    createdAt: "2026-06-03 08:21",
    invoice: {
      status: "已回传",
      title: "许言",
      number: "FP202606030014",
      issuedAt: "2026-06-03 18:30",
      image: "invoice",
    },
  },
  {
    id: "HX202606021102",
    status: "approved",
    customerName: "周闻",
    phone: "18800112233",
    productName: "iPhone 14 128GB 午夜色",
    sn: "M8Q2L7B4C1XA",
    imei1: "356789120437112",
    imei2: "356789120437120",
    amount: "4499.10",
    createdAt: "2026-06-02 16:12",
    invoice: {
      status: "待回传",
      title: "周闻",
      number: "",
      issuedAt: "",
      image: "",
    },
  },
];

new Vue({
  el: "#app",
  data() {
    return {
      screen: "verify",
      hasScanned: false,
      snInput: "",
      customerName: "",
      phone: "",
      idNo: "",
      paymentStatus: "idle",
      historyRange: "today",
      historyStatus: "all",
      historyKeyword: "",
      selectedHistoryOrder: null,
      voucherPhotos: {
        boxQr: null,
        activeSnImei: null,
        productFullBody: null,
      },
      toast: "",
      toastTimer: null,
      staff,
      product,
      historyStatusMap,
      historyOrders,
      voucherTasks: [
        {
          id: "boxQr",
          title: "包装盒标签区域",
          hint: "对准包装盒 SN/IMEI 标签区域，二维码和条码需完整清晰。",
          illustration: "box",
        },
        {
          id: "activeSnImei",
          title: "激活设备的 SN 码和 IMEI 码",
          hint: "拍摄已激活设备页面，确保 SN 码、IMEI 1、IMEI 2 清晰可识别。",
          illustration: "device",
        },
        {
          id: "productFullBody",
          title: "商品全身照",
          hint: "打开包装盒，将商品完整放入画面，保持主体清晰，适用于手机、平板（含学习机）、智能手环（手表）、智能摄影设备、无人机。",
          illustration: "product",
        },
      ],
    };
  },
  computed: {
    discountAmount() {
      return (this.product.listPrice * 0.1).toFixed(2);
    },
    subsidyPrice() {
      return (this.product.listPrice - this.product.listPrice * 0.1).toFixed(2);
    },
    listPrice() {
      return this.product.listPrice.toFixed(2);
    },
    snActionText() {
      if (this.hasScanned) return "重新扫码";
      return this.snInput.trim() ? "确认" : "扫码";
    },
    userReady() {
      return Boolean(this.customerName && this.phone && this.idNo);
    },
    canSubmitVerify() {
      return this.hasScanned && this.userReady;
    },
    voucherDoneCount() {
      return Object.values(this.voucherPhotos).filter(Boolean).length;
    },
    vouchersReady() {
      return this.voucherDoneCount === this.voucherTasks.length;
    },
    todayHistoryOrders() {
      return this.historyOrders.filter((order) => order.createdAt.indexOf("2026-06-03") === 0);
    },
    historyStats() {
      const orders = this.todayHistoryOrders;
      return {
        all: orders.length,
        pendingPay: orders.filter((order) => order.status === "pendingPay").length,
        pendingUpload: orders.filter((order) => order.status === "pendingUpload").length,
        pendingReview: orders.filter((order) => order.status === "pendingReview").length,
        rejected: orders.filter((order) => order.status === "rejected").length,
        approved: orders.filter((order) => order.status === "approved").length,
      };
    },
    rangeOrders() {
      if (this.historyRange === "today") {
        return this.todayHistoryOrders;
      }

      if (this.historyRange === "all") {
        return this.historyOrders;
      }

      const maxDays = this.historyRange === "week" ? 7 : 30;
      const current = new Date("2026-06-03T00:00:00");
      return this.historyOrders.filter((order) => {
        const orderDate = new Date(order.createdAt.slice(0, 10) + "T00:00:00");
        const diffDays = (current - orderDate) / 86400000;
        return diffDays >= 0 && diffDays < maxDays;
      });
    },
    filteredHistoryOrders() {
      const keyword = this.historyKeyword.trim();
      return this.rangeOrders.filter((order) => {
        const statusMatched = this.historyStatus === "all" || order.status === this.historyStatus;
        const keywordMatched = !keyword || order.id.includes(keyword) || order.phone.includes(keyword);
        return statusMatched && keywordMatched;
      });
    },
    currentHistoryLabel() {
      return this.historyStatusMap[this.historyStatus].label;
    },
  },
  methods: {
    showToast(message) {
      this.toast = message;
      window.clearTimeout(this.toastTimer);
      this.toastTimer = window.setTimeout(() => {
        this.toast = "";
      }, 1800);
    },
    normalizeSn() {
      this.snInput = this.snInput.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24).toUpperCase();
      this.hasScanned = false;
    },
    handleSnAction() {
      if (this.hasScanned) {
        this.snInput = "";
        this.hasScanned = false;
        this.showToast("请重新扫描或输入 SN 码");
        return;
      }

      if (this.snInput.trim()) {
        this.hasScanned = true;
        this.showToast("已按 SN 码拉取商品信息");
        return;
      }

      this.snInput = this.product.sn;
      this.hasScanned = true;
      this.showToast("已调起摄像头扫描 SN 码");
    },
    hydrateCustomer(source) {
      if (source === "name") {
        if (!this.customerName.trim()) {
          this.phone = "";
          this.idNo = "";
          return;
        }
        this.phone = customerProfile.phone;
        this.idNo = customerProfile.idNo;
        return;
      }

      this.phone = this.phone.replace(/\D/g, "").slice(0, 11);
      if (!this.phone) {
        this.customerName = "";
        this.idNo = "";
        return;
      }
      this.customerName = customerProfile.name;
      this.idNo = customerProfile.idNo;
    },
    goPayment() {
      if (!this.canSubmitVerify) return;
      this.screen = "payment";
    },
    backVerify() {
      this.screen = "verify";
    },
    scanPaymentCode() {
      this.paymentStatus = "processing";
      window.setTimeout(() => {
        this.paymentStatus = "success";
      }, 1400);
    },
    goVouchers() {
      this.screen = "vouchers";
    },
    backPayment() {
      this.screen = "payment";
    },
    setVoucherPhoto(id, event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        this.$set(this.voucherPhotos, id, reader.result);
      };
      reader.readAsDataURL(file);
    },
    removeVoucherPhoto(id) {
      this.$set(this.voucherPhotos, id, null);
    },
    previewVoucherPhoto(id) {
      const src = this.voucherPhotos[id];
      if (!src) return;
      const overlay = document.createElement("div");
      overlay.className = "preview-overlay";
      overlay.innerHTML = `<button onclick="this.parentElement.remove()">关闭</button><img src="${src}" alt="销售凭证大图" />`;
      document.body.appendChild(overlay);
    },
    submitVouchers() {
      if (!this.vouchersReady) return;
      this.screen = "review";
    },
    goHistory() {
      this.screen = "history";
    },
    setHistoryStatus(status) {
      this.historyStatus = status;
    },
    setHistoryRange(range) {
      this.historyRange = range;
    },
    historyAction(order) {
      if (order.status === "pendingPay") {
        this.screen = "payment";
        this.paymentStatus = "idle";
        this.showToast("已进入继续支付");
        return;
      }

      if (order.status === "pendingUpload" || order.status === "rejected") {
        this.screen = "vouchers";
        this.showToast(order.status === "rejected" ? "仅可修改上传凭证" : "请上传销售凭证");
        return;
      }

      this.selectedHistoryOrder = order;
      this.screen = "historyDetail";
    },
    orderActionText(status) {
      if (status === "pendingPay") return "继续支付";
      if (status === "pendingUpload") return "上传凭证";
      if (status === "rejected") return "修改凭证";
      return "查看详情";
    },
    backHistory() {
      this.screen = "history";
    },
    requestRefund() {
      this.showToast("已发起退货退款申请");
    },
    copyInvoiceNumber(number) {
      if (!number) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(number);
      }
      this.showToast("发票号码已复制");
    },
    copyText(text, message) {
      if (!text) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      }
      this.showToast(message);
    },
  },
  template: `
    <div class="app-frame">
      <section v-if="screen === 'verify'" class="app-page">
        <header class="app-header home-header">
          <h1>核销工作台</h1>
          <button class="history-entry" @click="goHistory" aria-label="历史核销">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7.4 7.1A7 7 0 1 1 5 12.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M5 5.2v4h4M12 8v4.2l2.8 1.7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            历史
          </button>
        </header>

        <section class="staff-card">
          <div class="staff-avatar">林</div>
          <div class="staff-copy">
            <div class="staff-title">
              <strong>{{ staff.name }}</strong>
              <span>{{ staff.role }}</span>
            </div>
            <p>{{ staff.store }}</p>
            <small>门店编号 {{ staff.storeCode }} · 工号 {{ staff.employeeNo }}</small>
          </div>
        </section>

        <section class="section-title">
          <h2>核销主体</h2>
          <span>{{ hasScanned ? '已扫码' : '待扫码' }}</span>
        </section>

        <section class="sn-card">
          <label class="sn-field">
            <span>SN 码</span>
            <input v-model="snInput" placeholder="扫码或手动输入 SN 码" @input="normalizeSn" />
          </label>
          <button class="pill-button" @click="handleSnAction">{{ snActionText }}</button>
        </section>

        <template v-if="hasScanned">
          <section class="result-card">
            <p>扫码结果</p>
            <strong>{{ product.name }}</strong>
          </section>

          <section class="info-row">
            <article class="info-card"><span>品牌</span><strong>{{ product.brand }}</strong></article>
            <article class="info-card"><span>品类</span><strong>{{ product.category }}</strong></article>
          </section>
          <section class="info-row">
            <article class="info-card"><span>IMEI 1</span><strong>{{ product.imei1 }}</strong></article>
            <article class="info-card"><span>IMEI 2</span><strong>{{ product.imei2 }}</strong></article>
          </section>
          <section class="info-row">
            <article class="info-card"><span>定价</span><strong>¥{{ listPrice }}</strong></article>
            <article class="info-card hot-price">
              <span>补贴后价格</span>
              <strong>¥{{ subsidyPrice }}</strong>
              <small>补贴额 ¥{{ discountAmount }}</small>
            </article>
          </section>
        </template>

        <section class="section-title">
          <h2>用户信息</h2>
          <span>{{ userReady ? '已完成' : '待填写' }}</span>
        </section>

        <section class="form-card">
          <label>
            <span>顾客姓名</span>
            <input v-model="customerName" placeholder="请输入顾客姓名" @input="hydrateCustomer('name')" />
          </label>
          <label>
            <span>顾客手机号</span>
            <input v-model="phone" inputmode="numeric" maxlength="11" placeholder="请输入 11 位手机号" @input="hydrateCustomer('phone')" />
          </label>
          <label>
            <span>身份证号</span>
            <input :value="idNo" readonly />
          </label>
          <button class="main-button" :disabled="!canSubmitVerify" @click="goPayment">确认提交</button>
        </section>
      </section>

      <section v-else-if="screen === 'history'" class="app-page">
        <header class="app-header back-header">
          <button class="back-button" @click="backVerify">‹</button>
          <h1>核销记录</h1>
        </header>

        <section class="history-stats">
          <button
            v-for="(meta, key) in historyStatusMap"
            :key="key"
            class="history-stat"
            :class="[meta.tone, { active: historyStatus === key }]"
            @click="setHistoryStatus(key)"
          >
            <span>{{ meta.label }}</span>
            <strong>{{ historyStats[key] }}</strong>
          </button>
        </section>

        <section class="history-search-card">
          <label class="history-search">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
              <path d="m16.5 16.5 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input v-model="historyKeyword" inputmode="search" placeholder="搜索订单号 / 手机号" />
          </label>
          <div class="range-tabs">
            <button :class="{ active: historyRange === 'today' }" @click="setHistoryRange('today')">今日</button>
            <button :class="{ active: historyRange === 'week' }" @click="setHistoryRange('week')">近7天</button>
            <button :class="{ active: historyRange === 'month' }" @click="setHistoryRange('month')">近30天</button>
            <button :class="{ active: historyRange === 'all' }" @click="setHistoryRange('all')">全部</button>
          </div>
        </section>

        <section class="history-toolbar">
          <div>
            <span>当前：{{ currentHistoryLabel }}</span>
            <strong>{{ filteredHistoryOrders.length }} 单</strong>
          </div>
        </section>

        <section v-if="filteredHistoryOrders.length" class="history-list">
          <article v-for="order in filteredHistoryOrders" :key="order.id" class="order-card">
            <div class="order-top">
              <span class="status-tag" :class="historyStatusMap[order.status].tone">{{ historyStatusMap[order.status].label }}</span>
              <small>{{ order.createdAt }}</small>
            </div>
            <div class="order-id-line">
              <span>订单号</span>
              <strong class="order-id">{{ order.id }}</strong>
              <button class="copy-button inline-copy" @click="copyText(order.id, '订单号已复制')" aria-label="复制订单号">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <p>{{ order.productName }}</p>
            <div class="order-meta">
              <span>{{ order.customerName }} · {{ order.phone }}</span>
              <span>SN {{ order.sn }}</span>
              <span>¥{{ order.amount }}</span>
            </div>
            <div v-if="order.status === 'rejected'" class="reject-reason">
              <span>驳回原因</span>
              <p>{{ order.rejectReason }}</p>
            </div>
            <button class="order-action" @click="historyAction(order)">{{ orderActionText(order.status) }}</button>
          </article>
        </section>

        <section v-else class="empty-state">
          <strong>暂无核销记录</strong>
          <p>可以调整搜索内容或时间范围后再试。</p>
          <button class="main-button active" @click="historyKeyword = ''; historyStatus = 'all'">清空筛选</button>
        </section>
      </section>

      <section v-else-if="screen === 'historyDetail' && selectedHistoryOrder" class="app-page">
        <header class="app-header back-header">
          <button class="back-button" @click="backHistory">‹</button>
          <h1>订单详情</h1>
        </header>

        <section class="detail-status-card" :class="historyStatusMap[selectedHistoryOrder.status].tone">
          <span class="status-tag" :class="historyStatusMap[selectedHistoryOrder.status].tone">
            {{ historyStatusMap[selectedHistoryOrder.status].label }}
          </span>
          <h2>{{ selectedHistoryOrder.status === 'approved' ? '审核通过' : '等待人工审核' }}</h2>
          <p>{{ selectedHistoryOrder.status === 'approved' ? '该订单已完成核销，发票由后台统一开具并回传。' : '销售凭证已提交，审核人员正在核验资料。' }}</p>
        </section>

        <section class="detail-card">
          <div><span>订单号</span><strong>{{ selectedHistoryOrder.id }}</strong></div>
          <div><span>产品名称</span><strong>{{ selectedHistoryOrder.productName }}</strong></div>
          <div><span>SN 码</span><strong>{{ selectedHistoryOrder.sn }}</strong></div>
          <div><span>IMEI 1</span><strong>{{ selectedHistoryOrder.imei1 }}</strong></div>
          <div><span>IMEI 2</span><strong>{{ selectedHistoryOrder.imei2 }}</strong></div>
        </section>

        <section class="detail-card">
          <div><span>顾客姓名</span><strong>{{ selectedHistoryOrder.customerName }}</strong></div>
          <div><span>顾客手机号</span><strong>{{ selectedHistoryOrder.phone }}</strong></div>
          <div><span>补贴后金额</span><strong class="money">¥{{ selectedHistoryOrder.amount }}</strong></div>
          <div><span>提交时间</span><strong>{{ selectedHistoryOrder.createdAt }}</strong></div>
        </section>

        <section v-if="selectedHistoryOrder.status === 'approved'" class="detail-card invoice-card">
          <div><span>发票状态</span><strong>{{ selectedHistoryOrder.invoice.status }}</strong></div>
          <div><span>发票抬头</span><strong>{{ selectedHistoryOrder.invoice.title }}</strong></div>
          <div>
            <span>发票号码</span>
            <strong class="copy-line">
              {{ selectedHistoryOrder.invoice.number || '后台开具后回传' }}
              <button
                v-if="selectedHistoryOrder.invoice.number"
                class="copy-button"
                @click="copyInvoiceNumber(selectedHistoryOrder.invoice.number)"
                aria-label="复制发票号码"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </strong>
          </div>
          <div><span>开票时间</span><strong>{{ selectedHistoryOrder.invoice.issuedAt || '待回传' }}</strong></div>
          <div class="invoice-photo-block">
            <span>发票照片</span>
            <div v-if="selectedHistoryOrder.invoice.image" class="invoice-photo">
              <div class="invoice-paper">
                <div class="invoice-paper-head">电子发票</div>
                <div class="invoice-paper-line wide"></div>
                <div class="invoice-paper-line"></div>
                <div class="invoice-paper-line short"></div>
                <div class="invoice-paper-total">¥{{ selectedHistoryOrder.amount }}</div>
              </div>
            </div>
            <strong v-else>后台开具后回传</strong>
          </div>
        </section>

        <section class="detail-voucher-card">
          <div class="detail-voucher-head">
            <h2>销售凭证</h2>
            <span>只读</span>
          </div>
          <div class="detail-voucher-list">
            <div>
              <svg viewBox="0 0 150 150" fill="none" aria-hidden="true">
                <rect x="24" y="28" width="102" height="84" rx="8" stroke="currentColor" stroke-width="4"/>
                <path d="M38 46h74M38 61h45M38 97h74" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                <rect x="89" y="59" width="24" height="24" stroke="currentColor" stroke-width="3"/>
              </svg>
              <span>包装盒标签区域</span>
            </div>
            <div>
              <svg viewBox="0 0 150 150" fill="none" aria-hidden="true">
                <rect x="37" y="12" width="76" height="126" rx="17" stroke="currentColor" stroke-width="4"/>
                <path d="M59 25h32M52 50h46M52 68h34M52 91h46M52 109h40" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
              </svg>
              <span>激活 SN/IMEI</span>
            </div>
          </div>
        </section>

        <button
          v-if="selectedHistoryOrder.status === 'approved'"
          class="refund-button"
          @click="requestRefund"
        >
          退货退款
        </button>
      </section>

      <section v-else-if="screen === 'payment'" class="app-page">
        <header class="app-header back-header">
          <button class="back-button" @click="backVerify">‹</button>
          <h1>支付收款</h1>
        </header>

        <section class="payment-info-card">
          <div><span>产品名称</span><strong>{{ product.name }}</strong></div>
          <div><span>SN 码</span><strong>{{ snInput || product.sn }}</strong></div>
          <div><span>IMEI 1</span><strong>{{ product.imei1 }}</strong></div>
          <div><span>IMEI 2</span><strong>{{ product.imei2 }}</strong></div>
        </section>

        <section class="amount-card">
          <span>应收金额</span>
          <strong>¥{{ subsidyPrice }}</strong>
        </section>

        <section class="company-card" :class="{ paid: paymentStatus === 'success' }">
          <div>
            <span>收款公司</span>
            <strong>济南赛米电子有限公司</strong>
          </div>
          <button v-if="paymentStatus !== 'success'" class="main-button active" @click="scanPaymentCode">扫描付款码</button>
          <div v-else class="success-status"><i>✓</i><strong>支付成功</strong></div>
        </section>

        <button v-if="paymentStatus === 'success'" class="main-button active standalone" @click="goVouchers">上传凭证</button>

        <div v-if="paymentStatus === 'processing'" class="mask">
          <div class="mask-card">
            <div class="spinner"></div>
            <strong>正在支付中</strong>
            <span>正在等待支付渠道确认</span>
          </div>
        </div>
      </section>

      <section v-else-if="screen === 'vouchers'" class="app-page">
        <header class="app-header back-header">
          <button class="back-button" @click="backPayment">‹</button>
          <h1>上传凭证</h1>
        </header>

        <section class="voucher-summary">
          <span>销售凭证</span>
          <strong>{{ voucherDoneCount }}/{{ voucherTasks.length }}</strong>
          <p>完成后系统将用于核销归档和系统对账。</p>
        </section>

        <section class="section-title">
          <h2>销售凭证</h2>
          <span>{{ voucherDoneCount }}/{{ voucherTasks.length }}</span>
        </section>

        <section class="task-list">
          <article v-for="task in voucherTasks" :key="task.id" class="task-card" :class="{ done: voucherPhotos[task.id] }">
            <div class="task-art" :class="{ tappable: voucherPhotos[task.id] }" @click="previewVoucherPhoto(task.id)">
              <img v-if="voucherPhotos[task.id]" :src="voucherPhotos[task.id]" :alt="task.title" />
              <svg v-else-if="task.illustration === 'box'" viewBox="0 0 150 150" fill="none" aria-hidden="true">
                <rect x="24" y="28" width="102" height="84" rx="8" stroke="currentColor" stroke-width="4"/>
                <path d="M38 46h74M38 61h45M38 97h74" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                <rect x="89" y="59" width="24" height="24" stroke="currentColor" stroke-width="3"/>
                <path d="M94 64h5v5h-5zM104 64h4v4h-4zM94 74h4v4h-4zM103 73h5v5h-5z" fill="currentColor"/>
              </svg>
              <svg v-else-if="task.illustration === 'device'" viewBox="0 0 150 150" fill="none" aria-hidden="true">
                <rect x="37" y="12" width="76" height="126" rx="17" stroke="currentColor" stroke-width="4"/>
                <path d="M59 25h32M52 50h46M52 68h34M52 91h46M52 109h40" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                <path d="M52 42h20M52 83h24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".45"/>
                <text x="75" y="128" fill="currentColor" font-size="12" text-anchor="middle">SN / IMEI</text>
              </svg>
              <svg v-else viewBox="0 0 150 150" fill="none" aria-hidden="true">
                <path d="M26 45V31c0-5 4-9 9-9h14M101 22h14c5 0 9 4 9 9v14M124 105v14c0 5-4 9-9 9h-14M49 128H35c-5 0-9-4-9-9v-14" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                <path d="M75 34 106 50v42l-31 17-31-17V50l31-16Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
                <path d="m44 50 31 17 31-17M75 67v42" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
                <path d="M53 118h42" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity=".42"/>
                <path d="M39 41c5-8 14-14 25-17M111 41c-5-8-14-14-25-17" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".35"/>
                <text x="75" y="137" fill="currentColor" font-size="12" text-anchor="middle">完整入镜</text>
              </svg>
            </div>
            <div class="task-copy">
              <div class="task-heading">
                <strong>{{ task.title }}</strong>
                <span>{{ voucherPhotos[task.id] ? '已上传' : '待拍摄' }}</span>
              </div>
              <p>{{ task.hint }}</p>
              <div class="task-actions">
                <label class="pill-button">
                  {{ voucherPhotos[task.id] ? '重新拍摄' : '拍照' }}
                  <input type="file" accept="image/*" capture="environment" @change="setVoucherPhoto(task.id, $event)" />
                </label>
                <button v-if="voucherPhotos[task.id]" class="delete-button" @click="removeVoucherPhoto(task.id)">删除</button>
              </div>
            </div>
          </article>
        </section>

        <button class="main-button voucher-submit" :disabled="!vouchersReady" @click="submitVouchers">确认上传</button>
      </section>

      <section v-else class="app-page review-page">
        <header class="app-header">
          <h1>人工审核</h1>
        </header>

        <section class="review-card">
          <div class="review-status-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <h2>等待人工审核</h2>
          <p>销售凭证已上传成功，审核人员正在核验资料，请耐心等待。</p>
        </section>

        <section class="review-detail-card">
          <div>
            <span>审核状态</span>
            <strong>审核中</strong>
          </div>
          <div>
            <span>产品名称</span>
            <strong>{{ product.name }}</strong>
          </div>
          <div>
            <span>SN 码</span>
            <strong>{{ snInput || product.sn }}</strong>
          </div>
          <div>
            <span>已上传凭证</span>
            <strong>{{ voucherDoneCount }} 张</strong>
          </div>
        </section>
      </section>

      <div v-if="toast" class="toast">{{ toast }}</div>
    </div>
  `,
});

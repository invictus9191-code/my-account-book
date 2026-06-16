import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const {
  useState,
  useEffect,
  useMemo
} = React;
const STORAGE_KEY = 'INV_HOUSEHOLD_DATA';
const FIREBASE_CONFIG_KEY = 'INV_FIREBASE_CONFIG';
const PASSWORD_KEY = 'INV_APP_PASSWORD';
const SHARED_ID_KEY = 'INV_SHARED_ID';
const DEFAULT_PASSWORD = '9999';
const initialData = {
  owners: [{
    id: 'o1',
    name: '홍길동'
  }],
  groups: [{
    id: 'g1',
    name: '주거래'
  }],
  assets: [{
    id: 'a1',
    ownerId: 'o1',
    groupId: 'g1',
    name: '현금',
    type: 'Cash',
    initialBalance: 0
  }],
  categories: [{
    id: 'ex1',
    type: 'Expense',
    name: '식비'
  }, {
    id: 'ex2',
    type: 'Expense',
    name: '카페/간식'
  }, {
    id: 'ex3',
    type: 'Expense',
    name: '외식/배달'
  }, {
    id: 'ex4',
    type: 'Expense',
    name: '생활용품'
  }, {
    id: 'ex5',
    type: 'Expense',
    name: '교통'
  }, {
    id: 'ex6',
    type: 'Expense',
    name: '주거/통신'
  }, {
    id: 'ex7',
    type: 'Expense',
    name: '건강'
  }, {
    id: 'ex8',
    type: 'Expense',
    name: '문화'
  }, {
    id: 'ex9',
    type: 'Expense',
    name: '여행'
  }, {
    id: 'ex10',
    type: 'Expense',
    name: '교육'
  }, {
    id: 'ex11',
    type: 'Expense',
    name: '경조사'
  }, {
    id: 'ex12',
    type: 'Expense',
    name: '대출'
  }, {
    id: 'ex13',
    type: 'Expense',
    name: '부모님'
  }, {
    id: 'ex14',
    type: 'Expense',
    name: '미용'
  }, {
    id: 'ex15',
    type: 'Expense',
    name: '용돈'
  }, {
    id: 'ex16',
    type: 'Expense',
    name: '기타'
  }, {
    id: 'in1',
    type: 'Income',
    name: '급여'
  }, {
    id: 'in2',
    type: 'Income',
    name: '금융수입'
  }, {
    id: 'in3',
    type: 'Income',
    name: '기타수입'
  }, {
    id: 'in4',
    type: 'Income',
    name: '보너스'
  }, {
    id: 'tr1',
    type: 'Transfer',
    name: '저축'
  }, {
    id: 'tr2',
    type: 'Transfer',
    name: '이체'
  }],
  transactions: []
};
const Icon = ({
  name,
  size = 18,
  className = ""
}) => {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [name]);
  return /*#__PURE__*/_jsxDEV("i", {
    "data-lucide": name,
    className: className,
    style: {
      width: size,
      height: size
    }
  }, void 0, false);
};
const calculateAssetBalance = (assetId, assets, transactions, upToDate) => {
  const asset = assets.find(a => a.id === assetId);
  if (!asset) return 0;
  const history = transactions.filter(t => {
    const match = t.assetId === assetId || t.toAssetId === assetId;
    if (upToDate) return match && t.date <= upToDate;
    return match;
  });
  return history.reduce((sum, t) => {
    const amt = Number(t.amount || 0);
    if (t.type === 'Income' && t.assetId === assetId) return sum + amt;
    if (t.type === 'Expense' && t.assetId === assetId) return sum - amt;
    if (t.type === 'Transfer') {
      if (t.assetId === assetId) return sum - amt;
      if (t.toAssetId === assetId) return sum + amt;
    }
    return sum;
  }, Number(asset.initialBalance || 0));
};
function Dashboard({
  data,
  setEdit,
  setShowModal,
  setEditAsset,
  setShowAssetModal
}) {
  const [categoryType, setCategoryType] = useState('Expense');
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const cats = data.categories ? data.categories.filter(c => c.type === 'Expense') : [];
    return cats.length > 0 ? cats[0].id : '';
  });
  useEffect(() => {
    const cats = data.categories.filter(c => c.type === categoryType);
    if (cats.length > 0 && !cats.find(c => c.id === selectedCategory)) {
      setSelectedCategory(cats[0].id);
    }
  }, [categoryType, data.categories, selectedCategory]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [view, setView] = useState('main'); // main, income_detail, expense_detail, asset_detail, category_list
  const [selectedId, setSelectedId] = useState(null); // categoryId or assetGroupId
  const [chartType, setChartType] = useState('income_expense'); // income_expense or savings

  const availableMonths = useMemo(() => {
    const months = new Set();
    data.transactions.forEach(t => months.add(t.date.substring(0, 7)));
    const now = new Date();
    months.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [data.transactions]);
  const stats = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const currentMonthT = data.transactions.filter(t => t.date.startsWith(selectedMonth));

    // Identify savings categories
    const savingsCategories = data.categories.filter(c => c.name === '저축' || c.name.includes('저축')).map(c => c.id);
    const income = currentMonthT.filter(t => t.type === 'Income').reduce((s, t) => s + Number(t.amount), 0);
    const rawExpense = currentMonthT.filter(t => t.type === 'Expense').reduce((s, t) => s + Number(t.amount), 0);
    const savings = currentMonthT.filter(t => (t.type === 'Expense' || t.type === 'Transfer') && savingsCategories.includes(t.categoryId)).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const expense = rawExpense - currentMonthT.filter(t => t.type === 'Expense' && savingsCategories.includes(t.categoryId)).reduce((s, t) => s + Number(t.amount), 0);

    // Previous month stats
    const prevDate = new Date(year, month - 2, 1);
    const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthT = data.transactions.filter(t => t.date.startsWith(prevMonthStr));
    const prevIncome = prevMonthT.filter(t => t.type === 'Income').reduce((s, t) => s + Number(t.amount), 0);
    const prevRawExpense = prevMonthT.filter(t => t.type === 'Expense').reduce((s, t) => s + Number(t.amount), 0);
    const prevSavings = prevMonthT.filter(t => (t.type === 'Expense' || t.type === 'Transfer') && savingsCategories.includes(t.categoryId)).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const prevExpense = prevRawExpense - prevMonthT.filter(t => t.type === 'Expense' && savingsCategories.includes(t.categoryId)).reduce((s, t) => s + Number(t.amount), 0);

    // Assets up to selected month
    const totalAssets = data.assets.reduce((sum, a) => {
      const initial = Number(a.initialBalance || 0);
      const history = data.transactions.filter(t => t.date <= `${selectedMonth}-31` && (t.assetId === a.id || t.toAssetId === a.id));
      const balance = history.reduce((s, t) => {
        const amt = Number(t.amount || 0);
        if (t.type === 'Income' && t.assetId === a.id) return s + amt;
        if (t.type === 'Expense' && t.assetId === a.id) return s - amt;
        if (t.type === 'Transfer') {
          if (t.assetId === a.id) return s - amt;
          if (t.toAssetId === a.id) return s + amt;
        }
        return s;
      }, initial);
      return sum + balance;
    }, 0);
    return {
      income,
      expense,
      savings,
      totalAssets,
      prevIncome,
      prevExpense
    };
  }, [selectedMonth, data.transactions, data.assets]);
  const annualData = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const labels = Array.from({
      length: 12
    }, (_, i) => {
      const d = new Date(year, month - 1 - (11 - i), 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const incomeData = labels.map(m => data.transactions.filter(t => t.date.startsWith(m) && t.type === 'Income').reduce((s, t) => s + Number(t.amount), 0));
    const savingsCategories = data.categories.filter(c => c.name === '저축' || c.name.includes('저축')).map(c => c.id);
    const savingsData = labels.map(m => data.transactions.filter(t => t.date.startsWith(m) && (t.type === 'Expense' || t.type === 'Transfer') && savingsCategories.includes(t.categoryId)).reduce((s, t) => s + Math.abs(Number(t.amount)), 0));
    const expenseData = labels.map(m => {
      const rawExp = data.transactions.filter(t => t.date.startsWith(m) && t.type === 'Expense').reduce((s, t) => s + Number(t.amount), 0);
      const sav = data.transactions.filter(t => t.date.startsWith(m) && t.type === 'Expense' && savingsCategories.includes(t.categoryId)).reduce((s, t) => s + Number(t.amount), 0);
      return rawExp - sav;
    });
    const assetData = labels.map(m => {
      return data.assets.reduce((sum, a) => {
        const initial = Number(a.initialBalance || 0);
        const history = data.transactions.filter(t => t.date <= `${m}-31` && (t.assetId === a.id || t.toAssetId === a.id));
        const balance = history.reduce((s, t) => {
          const amt = Number(t.amount || 0);
          if (t.type === 'Income' && t.assetId === a.id) return s + amt;
          if (t.type === 'Expense' && t.assetId === a.id) return s - amt;
          if (t.type === 'Transfer') {
            if (t.assetId === a.id) return s - amt;
            if (t.toAssetId === a.id) return s + amt;
          }
          return s;
        }, initial);
        return sum + balance;
      }, 0);
    });
    return {
      labels: labels.map(m => `${m.substring(5)}월`),
      incomeData,
      expenseData,
      savingsData,
      assetData
    };
  }, [selectedMonth, data.transactions, data.assets]);
  const annualCategoryData = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const labels = Array.from({
      length: 12
    }, (_, i) => {
      const d = new Date(year, month - 1 - (11 - i), 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const categoryData = labels.map(m => {
      return data.transactions.filter(t => t.date.startsWith(m) && t.categoryId === selectedCategory).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    });
    return {
      labels: labels.map(m => `${m.substring(5)}월`),
      categoryData
    };
  }, [selectedMonth, selectedCategory, data.transactions]);
  const getChartOptions = id => ({
    chart: {
      type: 'bar',
      id: id,
      toolbar: {
        show: false
      },
      background: 'transparent'
    },
    theme: {
      mode: 'dark'
    },
    xaxis: {
      categories: annualData.labels
    },
    yaxis: {
      labels: {
        formatter: value => typeof value === 'number' && !isNaN(value) ? Math.floor(value).toLocaleString() : value
      },
      forceNiceScale: true,
      decimalsInFloat: 0
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      borderColor: '#30363d'
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: value => typeof value === 'number' && !isNaN(value) ? Math.floor(value).toLocaleString() + '원' : value + '원'
      }
    }
  });
  const renderDiff = (curr, prev) => {
    const diff = curr - prev;
    const icon = diff >= 0 ? 'trending-up' : 'trending-down';
    const color = diff >= 0 ? 'var(--income-color)' : 'var(--expense-color)';
    return /*#__PURE__*/_jsxDEV("div", {
      style: {
        fontSize: '0.75rem',
        color,
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        marginTop: '6px',
        opacity: 0.85
      },
      children: [/*#__PURE__*/_jsxDEV(Icon, {
        name: icon,
        size: 12
      }, void 0, false), " ", Math.abs(diff).toLocaleString(), " ", diff >= 0 ? '▲' : '▼', " 전월 대비"]
    }, void 0, true);
  };
  if (view === 'income_detail' || view === 'expense_detail' || view === 'savings_detail') {
    const type = view === 'income_detail' ? 'Income' : 'Expense';
    const savingsCategories = data.categories.filter(c => c.name === '저축' || c.name.includes('저축')).map(c => c.id);

    // 이번달 거래
    const monthT = data.transactions.filter(t => {
      if (!t.date.startsWith(selectedMonth)) return false;
      if (view === 'savings_detail') return (t.type === 'Expense' || t.type === 'Transfer') && savingsCategories.includes(t.categoryId);
      if (view === 'expense_detail') return t.type === 'Expense' && !savingsCategories.includes(t.categoryId);
      return t.type === type;
    });

    // 전월 계산
    const [selYear, selMon] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(selYear, selMon - 2, 1);
    const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthT = data.transactions.filter(t => {
      if (!t.date.startsWith(prevMonth)) return false;
      if (view === 'savings_detail') return (t.type === 'Expense' || t.type === 'Transfer') && savingsCategories.includes(t.categoryId);
      if (view === 'expense_detail') return t.type === 'Expense' && !savingsCategories.includes(t.categoryId);
      return t.type === type;
    });
    const catGrouped = data.categories.filter(c => {
      if (view === 'savings_detail') return savingsCategories.includes(c.id);
      if (view === 'expense_detail') return c.type === 'Expense' && !savingsCategories.includes(c.id);
      return c.type === type;
    }).map(c => ({
      ...c,
      amount: monthT.filter(t => t.categoryId === c.id).reduce((s, t) => s + Number(t.amount), 0),
      prevAmount: prevMonthT.filter(t => t.categoryId === c.id).reduce((s, t) => s + Number(t.amount), 0)
    })).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);
    return /*#__PURE__*/_jsxDEV("div", {
      className: "fade-in",
      children: [/*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '1.5rem'
        },
        children: [/*#__PURE__*/_jsxDEV("button", {
          onClick: () => setView('main'),
          className: "icon-btn",
          children: /*#__PURE__*/_jsxDEV(Icon, {
            name: "arrow-left"
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV("h1", {
          className: "detail-title",
          children: [selectedMonth, " ", view === 'income_detail' ? '수입' : view === 'expense_detail' ? '지출' : '저축', " 카테고리별"]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "card",
        children: [catGrouped.map(c => {
          const diff = c.amount - c.prevAmount;
          const hasPrev = c.prevAmount > 0;
          return /*#__PURE__*/_jsxDEV("div", {
            className: "list-item",
            onClick: () => {
              setSelectedId(c.id);
              setView('category_list');
            },
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              borderBottom: '1px solid #30363d',
              cursor: 'pointer'
            },
            children: [/*#__PURE__*/_jsxDEV("span", {
              children: c.name
            }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '2px'
              },
              children: [/*#__PURE__*/_jsxDEV("span", {
                style: {
                  fontWeight: 600
                },
                children: [c.amount.toLocaleString(), "원 ", /*#__PURE__*/_jsxDEV(Icon, {
                  name: "chevron-right",
                  size: 14
                }, void 0, false)]
              }, void 0, true), hasPrev && /*#__PURE__*/_jsxDEV("span", {
                style: {
                  fontSize: '0.78rem',
                  color: diff > 0 ? 'var(--expense-color)' : diff < 0 ? 'var(--income-color)' : 'var(--text-secondary)'
                },
                children: [diff > 0 ? '▲' : diff < 0 ? '▼' : '─', " ", Math.abs(diff).toLocaleString(), "원 전월대비"]
              }, void 0, true)]
            }, void 0, true)]
          }, c.id, true);
        }), catGrouped.length === 0 && /*#__PURE__*/_jsxDEV("div", {
          style: {
            padding: '2rem',
            textAlign: 'center'
          },
          children: "데이터가 없습니다."
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true);
  }
  if (view === 'category_list') {
    const category = data.categories.find(c => c.id === selectedId);
    const list = data.transactions.filter(t => t.date.startsWith(selectedMonth) && t.categoryId === selectedId).sort((a, b) => b.date.localeCompare(a.date));
    const savingsCategories = data.categories.filter(c => c.name === '저축' || c.name.includes('저축')).map(c => c.id);
    const backView = category.type === 'Income' ? 'income_detail' : savingsCategories.includes(category.id) ? 'savings_detail' : 'expense_detail';
    return /*#__PURE__*/_jsxDEV("div", {
      className: "fade-in",
      children: [/*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '1.5rem'
        },
        children: [/*#__PURE__*/_jsxDEV("button", {
          onClick: () => setView(backView),
          className: "icon-btn",
          children: /*#__PURE__*/_jsxDEV(Icon, {
            name: "arrow-left"
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV("h1", {
          className: "detail-title",
          children: [selectedMonth, " ", category.name, " 내역"]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "card",
        style: {
          padding: 0
        },
        children: /*#__PURE__*/_jsxDEV("table", {
          className: "transaction-table",
          children: [/*#__PURE__*/_jsxDEV("thead", {
            children: /*#__PURE__*/_jsxDEV("tr", {
              children: [/*#__PURE__*/_jsxDEV("th", {
                children: "날짜"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "금액"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                className: "mobile-hide",
                children: "자산"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "메모"
              }, void 0, false)]
            }, void 0, true)
          }, void 0, false), /*#__PURE__*/_jsxDEV("tbody", {
            children: list.map(t => /*#__PURE__*/_jsxDEV("tr", {
              onClick: () => {
                setEdit(t);
                setShowModal(true);
              },
              style: {
                cursor: 'pointer'
              },
              className: "list-item",
              children: [/*#__PURE__*/_jsxDEV("td", {
                children: [t.date.substring(8), "일"]
              }, void 0, true), /*#__PURE__*/_jsxDEV("td", {
                style: {
                  fontWeight: 600
                },
                children: Number(t.amount).toLocaleString()
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                className: "mobile-hide",
                children: data.assets.find(a => a.id === t.assetId)?.name
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: t.memo
              }, void 0, false)]
            }, t.id, true))
          }, void 0, false)]
        }, void 0, true)
      }, void 0, false)]
    }, void 0, true);
  }
  if (view === 'asset_detail') {
    const upToDate = `${selectedMonth}-31`;
    const groupGrouped = (data.groups || []).map(g => {
      const assets = data.assets.filter(a => a.groupId === g.id);
      const total = assets.reduce((sum, a) => sum + calculateAssetBalance(a.id, data.assets, data.transactions, upToDate), 0);
      return {
        ...g,
        total,
        assets
      };
    }).filter(g => g.total !== 0 || g.assets.length > 0);
    return /*#__PURE__*/_jsxDEV("div", {
      className: "fade-in",
      children: [/*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '1.5rem'
        },
        children: [/*#__PURE__*/_jsxDEV("button", {
          onClick: () => setView('main'),
          className: "icon-btn",
          children: /*#__PURE__*/_jsxDEV(Icon, {
            name: "arrow-left"
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV("h1", {
          className: "detail-title",
          children: ["자산 현황 (", selectedMonth.split('-')[0], "년 ", selectedMonth.split('-')[1], "월 말 기준)"]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "card",
        children: groupGrouped.map(g => /*#__PURE__*/_jsxDEV("div", {
          style: {
            marginBottom: '1.5rem'
          },
          children: [/*#__PURE__*/_jsxDEV("h3", {
            style: {
              borderBottom: '1px solid #30363d',
              paddingBottom: '0.5rem',
              marginBottom: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between'
            },
            children: [g.name, " ", /*#__PURE__*/_jsxDEV("span", {
              children: [g.total.toLocaleString(), "원"]
            }, void 0, true)]
          }, void 0, true), g.assets.map(a => {
            const bal = calculateAssetBalance(a.id, data.assets, data.transactions, upToDate);
            return /*#__PURE__*/_jsxDEV("div", {
              onClick: () => {
                setEditAsset(a);
                setShowAssetModal(true);
              },
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                paddingLeft: '1rem',
                paddingBottom: '0.3rem',
                color: '#8b949e',
                cursor: 'pointer'
              },
              className: "list-item",
              children: [/*#__PURE__*/_jsxDEV("span", {
                children: a.name
              }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
                children: [bal.toLocaleString(), "원"]
              }, void 0, true)]
            }, a.id, true);
          })]
        }, g.id, true))
      }, void 0, false)]
    }, void 0, true);
  }
  return /*#__PURE__*/_jsxDEV("div", {
    className: "fade-in",
    children: [/*#__PURE__*/_jsxDEV("div", {
      style: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: '1.5rem'
      },
      children: /*#__PURE__*/_jsxDEV("select", {
        className: "month-select",
        value: selectedMonth,
        onChange: e => setSelectedMonth(e.target.value),
        style: {
          padding: '0.5rem',
          borderRadius: '6px',
          background: '#21262d',
          color: 'white',
          border: '1px solid #30363d'
        },
        children: availableMonths.map(m => {
          const [y, mon] = m.split('-');
          return /*#__PURE__*/_jsxDEV("option", {
            value: m,
            children: [y, "년 ", mon, "월"]
          }, m, true);
        })
      }, void 0, false)
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "dashboard-grid",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "card stat-card interactive",
        onClick: () => setView('income_detail'),
        children: [/*#__PURE__*/_jsxDEV("span", {
          className: "stat-label stat-title-white",
          children: "수입"
        }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
          className: "stat-value",
          children: [stats.income.toLocaleString(), "원"]
        }, void 0, true), renderDiff(stats.income, stats.prevIncome)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "card stat-card interactive",
        onClick: () => setView('expense_detail'),
        children: [/*#__PURE__*/_jsxDEV("span", {
          className: "stat-label stat-title-white",
          children: "지출"
        }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
          className: "stat-value",
          children: [stats.expense.toLocaleString(), "원"]
        }, void 0, true), renderDiff(stats.expense, stats.prevExpense)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "card stat-card interactive",
        onClick: () => setView('savings_detail'),
        children: [/*#__PURE__*/_jsxDEV("span", {
          className: "stat-label stat-title-white",
          children: "저축"
        }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
          className: "stat-value",
          children: [stats.savings.toLocaleString(), "원"]
        }, void 0, true), stats.prevSavings !== undefined && /*#__PURE__*/_jsxDEV("div", {
          className: `stat-change ${stats.savings >= stats.prevSavings ? 'plus' : 'minus'}`,
          children: ["전월 대비 ", Math.abs(stats.savings - stats.prevSavings).toLocaleString(), "원 ", stats.savings >= stats.prevSavings ? '증가' : '감소']
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "card stat-card interactive",
        onClick: () => setView('asset_detail'),
        children: [/*#__PURE__*/_jsxDEV("span", {
          className: "stat-label",
          children: "자산 총액"
        }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
          className: "stat-value",
          children: [stats.totalAssets.toLocaleString(), "원"]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          style: {
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            marginTop: '4px'
          },
          children: [selectedMonth.split('-')[1], "월 말 기준"]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "dashboard-grid",
      style: {
        marginTop: '1.5rem'
      },
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "card",
        children: [/*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          },
          children: [/*#__PURE__*/_jsxDEV("h3", {
            children: "연간 흐름"
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            style: {
              display: 'flex',
              gap: '0.5rem',
              background: 'rgba(22, 27, 34, 0.4)',
              padding: '4px',
              borderRadius: '8px'
            },
            children: [/*#__PURE__*/_jsxDEV("button", {
              onClick: () => setChartType('income_expense'),
              style: {
                background: chartType === 'income_expense' ? '#30363d' : 'transparent',
                color: chartType === 'income_expense' ? 'white' : '#8b949e',
                padding: '0.3rem 0.6rem',
                fontSize: '0.85rem'
              },
              children: "수입/지출"
            }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
              onClick: () => setChartType('savings'),
              style: {
                background: chartType === 'savings' ? '#30363d' : 'transparent',
                color: chartType === 'savings' ? 'white' : '#8b949e',
                padding: '0.3rem 0.6rem',
                fontSize: '0.85rem'
              },
              children: "저축"
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), window.ReactApexChart ? chartType === 'income_expense' ? /*#__PURE__*/_jsxDEV(window.ReactApexChart, {
          options: {
            ...getChartOptions('chart-income-expense'),
            colors: ['#238636', '#da3633']
          },
          series: [{
            name: '수입',
            data: annualData.incomeData
          }, {
            name: '지출',
            data: annualData.expenseData
          }],
          type: "bar",
          height: 280
        }, void 0, false) : /*#__PURE__*/_jsxDEV(window.ReactApexChart, {
          options: {
            ...getChartOptions('chart-savings'),
            colors: ['#1f6feb']
          },
          series: [{
            name: '저축',
            data: annualData.savingsData
          }],
          type: "bar",
          height: 280
        }, void 0, false) : "차트 로딩 중..."]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "card",
        children: [/*#__PURE__*/_jsxDEV("h3", {
          children: "연간 자산 흐름"
        }, void 0, false), window.ReactApexChart ? /*#__PURE__*/_jsxDEV(window.ReactApexChart, {
          options: {
            ...getChartOptions('chart-assets'),
            colors: ['#58a6ff']
          },
          series: [{
            name: '자산액',
            data: annualData.assetData
          }],
          type: "bar",
          height: 280
        }, void 0, false) : "차트 로딩 중..."]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      style: {
        marginTop: '1.5rem'
      },
      children: [/*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        },
        children: [/*#__PURE__*/_jsxDEV("h3", {
          children: "카테고리별 연간 흐름"
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            gap: '0.5rem'
          },
          children: [/*#__PURE__*/_jsxDEV("select", {
            value: categoryType,
            onChange: e => setCategoryType(e.target.value),
            style: {
              padding: '0.4rem',
              borderRadius: '6px',
              background: '#21262d',
              color: 'white',
              border: '1px solid #30363d',
              fontSize: '0.9rem'
            },
            children: [/*#__PURE__*/_jsxDEV("option", {
              value: "Expense",
              children: "지출"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "Income",
              children: "수입"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "Transfer",
              children: "이체/저축"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("select", {
            value: selectedCategory,
            onChange: e => setSelectedCategory(e.target.value),
            style: {
              padding: '0.4rem',
              borderRadius: '6px',
              background: '#21262d',
              color: 'white',
              border: '1px solid #30363d',
              maxWidth: '150px',
              fontSize: '0.9rem'
            },
            children: data.categories.filter(c => c.type === categoryType).map(c => /*#__PURE__*/_jsxDEV("option", {
              value: c.id,
              children: c.name
            }, c.id, false))
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true), window.ReactApexChart ? /*#__PURE__*/_jsxDEV(window.ReactApexChart, {
        options: {
          ...getChartOptions('chart-category'),
          colors: ['#a371f7']
        },
        series: [{
          name: '금액',
          data: annualCategoryData.categoryData
        }],
        type: "bar",
        height: 280
      }, void 0, false) : "차트 로딩 중..."]
    }, void 0, true)]
  }, void 0, true);
}
function TransactionPage({
  data,
  setData,
  setEdit,
  setShowModal,
  syncToCloud,
  searchTerm,
  setSearchTerm,
  isConnected,
  authorFilter,
  setAuthorFilter
}) {
  const del = id => {
    if (confirm('삭제하시겠습니까?')) {
      const newData = {
        ...data,
        transactions: data.transactions.filter(t => t.id !== id)
      };
      setData(newData);
      syncToCloud(newData);
    }
  };
  const filteredTransactions = data.transactions.filter(t => {
    if (authorFilter !== 'ALL' && t.authorEmail !== authorFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const memoMatch = t.memo?.toLowerCase().includes(term);
    const categoryMatch = data.categories.find(c => c.id === t.categoryId)?.name?.toLowerCase().includes(term);
    const assetMatch = data.assets.find(a => a.id === t.assetId)?.name?.toLowerCase().includes(term);
    const toAssetMatch = t.type === 'Transfer' && data.assets.find(a => a.id === t.toAssetId)?.name?.toLowerCase().includes(term);
    return memoMatch || categoryMatch || assetMatch || toAssetMatch;
  });
  const grouped = filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).reduce((acc, t) => {
    const month = t.date.substring(0, 7); // YYYY-MM
    if (!acc[month]) acc[month] = {
      transactions: [],
      income: 0,
      expense: 0,
      savings: 0
    };
    acc[month].transactions.push(t);
    const savingsCategories = data.categories.filter(c => c.name === '저축' || c.name.includes('저축')).map(c => c.id);
    if (t.type === 'Income') acc[month].income += Number(t.amount);
    if ((t.type === 'Expense' || t.type === 'Transfer') && savingsCategories.includes(t.categoryId)) {
      acc[month].savings += Math.abs(Number(t.amount));
    }
    if (t.type === 'Expense' && !savingsCategories.includes(t.categoryId)) {
      acc[month].expense += Number(t.amount);
    }
    return acc;
  }, {});
  const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  return /*#__PURE__*/_jsxDEV("div", {
    className: "fade-in",
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "page-header",
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      },
      children: [/*#__PURE__*/_jsxDEV("h1", {
        className: "page-title",
        children: "거래 내역"
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        className: "header-actions",
        style: {
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flex: 1,
          justifyContent: 'flex-end'
        },
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "filter-box mobile-hide",
          style: {
            marginRight: '5px'
          },
          children: /*#__PURE__*/_jsxDEV("select", {
            value: authorFilter,
            onChange: e => setAuthorFilter(e.target.value),
            style: {
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #30363d',
              background: '#21262d',
              color: 'white',
              fontWeight: 'bold'
            },
            children: [/*#__PURE__*/_jsxDEV("option", {
              value: "ALL",
              children: "전체"
            }, void 0, false), Array.from(new Set(data.transactions.map(t => t.authorEmail).filter(Boolean))).map(email => {
              const abbrs = data.authorAbbreviations || [];
              const found = abbrs.find(a => a.email === email);
              const label = found ? found.abbr : email;
              return /*#__PURE__*/_jsxDEV("option", {
                value: email,
                children: label
              }, email, false);
            })]
          }, void 0, true)
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "search-box mobile-hide",
          style: {
            position: 'relative',
            flex: 1,
            maxWidth: '300px'
          },
          children: [/*#__PURE__*/_jsxDEV(Icon, {
            name: "search",
            size: 16,
            style: {
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8b949e'
            }
          }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
            className: "search-input",
            type: "text",
            placeholder: "검색어 입력...",
            value: searchTerm,
            onChange: e => setSearchTerm(e.target.value),
            style: {
              paddingLeft: '32px',
              paddingRight: '10px',
              paddingTop: '8px',
              paddingBottom: '8px',
              borderRadius: '6px',
              border: '1px solid #30363d',
              background: '#0d1117',
              color: '#c9d1d9',
              width: '100%'
            }
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
          className: `primary header-add-btn ${!isConnected ? 'btn-disabled' : ''}`,
          onClick: () => {
            if (!isConnected) {
              alert('Firebase 연동이 필요합니다.');
              return;
            }
            setEdit(null);
            setShowModal(true);
          },
          title: !isConnected ? "Firebase 연동 시에만 작성 가능합니다." : "",
          children: "+ 거래 추가"
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      style: {
        overflowX: 'auto',
        padding: 0
      },
      children: /*#__PURE__*/_jsxDEV("table", {
        className: "transaction-table",
        children: [/*#__PURE__*/_jsxDEV("thead", {
          children: /*#__PURE__*/_jsxDEV("tr", {
            children: [/*#__PURE__*/_jsxDEV("th", {
              children: "날짜"
            }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
              className: "mobile-hide",
              children: "구분"
            }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
              className: "mobile-hide",
              children: "카테고리"
            }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
              children: "금액"
            }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
              className: "mobile-hide",
              children: "자산"
            }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
              children: "메모"
            }, void 0, false)]
          }, void 0, true)
        }, void 0, false), /*#__PURE__*/_jsxDEV("tbody", {
          children: [sortedMonths.map(month => {
            const [y, m] = month.split('-');
            const {
              transactions,
              income,
              expense
            } = grouped[month];
            return /*#__PURE__*/_jsxDEV(React.Fragment, {
              children: [/*#__PURE__*/_jsxDEV("tr", {
                style: {
                  background: 'rgba(56, 139, 253, 0.1)',
                  fontWeight: 'bold'
                },
                children: /*#__PURE__*/_jsxDEV("td", {
                  colSpan: "6",
                  style: {
                    padding: '0.5rem 1rem',
                    fontSize: '1rem',
                    color: '#58a6ff'
                  },
                  children: [/*#__PURE__*/_jsxDEV("div", {
                    children: ["[", y, "년 ", m, "월]"]
                  }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
                    style: {
                      fontSize: '0.85rem',
                      marginTop: '0.2rem'
                    },
                    children: ["(수입: ", income.toLocaleString(), " / 지출: ", expense.toLocaleString(), " / 저축: ", grouped[month].savings.toLocaleString(), ")"]
                  }, void 0, true)]
                }, void 0, true)
              }, void 0, false), transactions.map(t => /*#__PURE__*/_jsxDEV("tr", {
                onClick: () => {
                  setEdit(t);
                  setShowModal(true);
                },
                style: {
                  cursor: 'pointer'
                },
                children: [/*#__PURE__*/_jsxDEV("td", {
                  style: {
                    fontWeight: '500'
                  },
                  children: [new Date(t.date).getDate(), "일"]
                }, void 0, true), /*#__PURE__*/_jsxDEV("td", {
                  className: `type-${t.type.toLowerCase()} mobile-hide`,
                  children: t.type === 'Income' ? '수입' : t.type === 'Expense' ? '지출' : '이체'
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  className: "mobile-hide",
                  children: data.categories.find(c => c.id === t.categoryId)?.name || '-'
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  style: {
                    fontWeight: '600'
                  },
                  className: `type-${t.type.toLowerCase()}`,
                  children: [t.type === 'Expense' ? '-' : t.type === 'Income' ? '+' : '', Number(t.amount).toLocaleString()]
                }, void 0, true), /*#__PURE__*/_jsxDEV("td", {
                  className: "mobile-hide",
                  children: t.type === 'Transfer' ? /*#__PURE__*/_jsxDEV("span", {
                    children: [data.assets.find(a => a.id === t.assetId)?.name, " → ", data.assets.find(a => a.id === t.toAssetId)?.name]
                  }, void 0, true) : /*#__PURE__*/_jsxDEV("span", {
                    children: data.assets.find(a => a.id === t.assetId)?.name
                  }, void 0, false)
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  children: /*#__PURE__*/_jsxDEV("div", {
                    style: {
                      maxWidth: '150px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    },
                    children: t.memo
                  }, void 0, false)
                }, void 0, false)]
              }, t.id, true))]
            }, month, true);
          }), filteredTransactions.length === 0 && /*#__PURE__*/_jsxDEV("tr", {
            children: /*#__PURE__*/_jsxDEV("td", {
              colSpan: "6",
              style: {
                textAlign: 'center',
                padding: '2rem'
              },
              children: "검색 결과가 없습니다."
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true)
    }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
      className: `fab-add-transaction ${!isConnected ? 'btn-disabled' : ''}`,
      onClick: () => {
        if (!isConnected) {
          alert('Firebase 연동이 필요합니다.');
          return;
        }
        setEdit(null);
        setShowModal(true);
      },
      style: {
        display: 'none'
      },
      children: /*#__PURE__*/_jsxDEV(Icon, {
        name: "plus",
        size: 32
      }, void 0, false)
    }, void 0, false)]
  }, void 0, true);
}
function AssetManagementPage({
  data,
  setEdit,
  setShowModal
}) {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const groupGrouped = (data.groups || []).map(g => {
    const assets = data.assets.filter(a => a.groupId === g.id);
    const total = assets.reduce((sum, a) => sum + calculateAssetBalance(a.id, data.assets, data.transactions), 0);
    return {
      ...g,
      total,
      assets
    };
  }).filter(g => g.assets.length > 0);
  const uncategorizedAssets = data.assets.filter(a => !a.groupId);
  const uncategorizedTotal = uncategorizedAssets.reduce((sum, a) => sum + calculateAssetBalance(a.id, data.assets, data.transactions), 0);
  if (uncategorizedAssets.length > 0) {
    groupGrouped.push({
      id: 'uncategorized',
      name: '미지정 그룹',
      total: uncategorizedTotal,
      assets: uncategorizedAssets
    });
  }

  // 자산 거래내역 뷰
  if (selectedAsset) {
    const asset = selectedAsset;
    const txList = data.transactions.filter(t => t.assetId === asset.id || t.toAssetId === asset.id).sort((a, b) => b.date.localeCompare(a.date));

    // 월별 그룹핑
    const grouped = txList.reduce((acc, t) => {
      const month = t.date.substring(0, 7);
      if (!acc[month]) acc[month] = {
        transactions: [],
        income: 0,
        expense: 0
      };
      acc[month].transactions.push(t);
      if (t.type === 'Income' && t.assetId === asset.id) acc[month].income += Number(t.amount);
      if (t.type === 'Transfer' && t.toAssetId === asset.id) acc[month].income += Number(t.amount);
      if (t.type === 'Expense' && t.assetId === asset.id) acc[month].expense += Number(t.amount);
      if (t.type === 'Transfer' && t.assetId === asset.id) acc[month].expense += Number(t.amount);
      return acc;
    }, {});
    const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
    return /*#__PURE__*/_jsxDEV("div", {
      className: "fade-in",
      children: [/*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '1rem'
        },
        children: [/*#__PURE__*/_jsxDEV("button", {
          onClick: () => setSelectedAsset(null),
          className: "icon-btn",
          children: /*#__PURE__*/_jsxDEV(Icon, {
            name: "arrow-left"
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV("h1", {
          className: "detail-title",
          children: [asset.name, " 거래내역"]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "card",
        style: {
          overflowX: 'hidden',
          padding: 0
        },
        children: /*#__PURE__*/_jsxDEV("table", {
          className: "transaction-table",
          children: [/*#__PURE__*/_jsxDEV("thead", {
            children: /*#__PURE__*/_jsxDEV("tr", {
              children: [/*#__PURE__*/_jsxDEV("th", {
                children: "날짜"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                className: "mobile-hide",
                children: "구분"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                className: "mobile-hide",
                children: "카테고리"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "금액"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                className: "mobile-hide",
                children: "자산"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "메모"
              }, void 0, false)]
            }, void 0, true)
          }, void 0, false), /*#__PURE__*/_jsxDEV("tbody", {
            children: [sortedMonths.map(month => {
              const [y, m] = month.split('-');
              const {
                transactions: txs,
                income: monthIncome,
                expense: monthExpense
              } = grouped[month];
              return /*#__PURE__*/_jsxDEV(React.Fragment, {
                children: [/*#__PURE__*/_jsxDEV("tr", {
                  style: {
                    background: 'rgba(56, 139, 253, 0.1)',
                    fontWeight: 'bold'
                  },
                  children: /*#__PURE__*/_jsxDEV("td", {
                    colSpan: "6",
                    style: {
                      padding: '0.5rem 1rem',
                      fontSize: '1rem',
                      color: '#58a6ff'
                    },
                    children: [/*#__PURE__*/_jsxDEV("div", {
                      children: ["[", y, "년 ", m, "월]"]
                    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
                      style: {
                        fontSize: '0.85rem',
                        marginTop: '0.2rem'
                      },
                      children: ["(수입: ", monthIncome.toLocaleString(), " / 지출: ", monthExpense.toLocaleString(), ")"]
                    }, void 0, true)]
                  }, void 0, true)
                }, void 0, false), txs.map(t => /*#__PURE__*/_jsxDEV("tr", {
                  onClick: () => {
                    setEdit(t);
                    setShowModal(true);
                  },
                  style: {
                    cursor: 'pointer'
                  },
                  className: "list-item",
                  children: [/*#__PURE__*/_jsxDEV("td", {
                    style: {
                      fontWeight: '500'
                    },
                    children: [new Date(t.date).getDate(), "일"]
                  }, void 0, true), /*#__PURE__*/_jsxDEV("td", {
                    className: `type-${t.type.toLowerCase()} mobile-hide`,
                    children: t.type === 'Income' ? '수입' : t.type === 'Expense' ? '지출' : '이체'
                  }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                    className: "mobile-hide",
                    children: data.categories.find(c => c.id === t.categoryId)?.name || '-'
                  }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                    style: {
                      fontWeight: '600'
                    },
                    className: `type-${t.type.toLowerCase()}`,
                    children: [t.type === 'Expense' && t.assetId === asset.id ? '-' : t.type === 'Income' && t.assetId === asset.id ? '+' : t.type === 'Transfer' && t.toAssetId === asset.id ? '+' : t.type === 'Transfer' && t.assetId === asset.id ? '-' : '', Number(t.amount).toLocaleString()]
                  }, void 0, true), /*#__PURE__*/_jsxDEV("td", {
                    className: "mobile-hide",
                    children: t.type === 'Transfer' ? /*#__PURE__*/_jsxDEV("span", {
                      children: [data.assets.find(a => a.id === t.assetId)?.name, " → ", data.assets.find(a => a.id === t.toAssetId)?.name]
                    }, void 0, true) : /*#__PURE__*/_jsxDEV("span", {
                      children: data.assets.find(a => a.id === t.assetId)?.name
                    }, void 0, false)
                  }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                    children: /*#__PURE__*/_jsxDEV("div", {
                      style: {
                        maxWidth: '150px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      },
                      children: t.memo
                    }, void 0, false)
                  }, void 0, false)]
                }, t.id, true))]
              }, month, true);
            }), txList.length === 0 && /*#__PURE__*/_jsxDEV("tr", {
              children: /*#__PURE__*/_jsxDEV("td", {
                colSpan: "6",
                style: {
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#8b949e'
                },
                children: "거래 내역이 없습니다."
              }, void 0, false)
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true)
      }, void 0, false)]
    }, void 0, true);
  }
  return /*#__PURE__*/_jsxDEV("div", {
    className: "fade-in",
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      children: [groupGrouped.map(g => /*#__PURE__*/_jsxDEV("div", {
        style: {
          marginBottom: '2rem'
        },
        children: [/*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            paddingBottom: '0.8rem',
            borderBottom: '2px solid #30363d',
            marginBottom: '1rem'
          },
          children: [/*#__PURE__*/_jsxDEV("h3", {
            style: {
              color: '#58a6ff'
            },
            children: g.name
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            style: {
              fontWeight: 'bold',
              fontSize: '1.1rem',
              color: '#58a6ff'
            },
            children: [g.total.toLocaleString(), "원"]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          },
          children: g.assets.map(a => {
            const bal = calculateAssetBalance(a.id, data.assets, data.transactions);
            return /*#__PURE__*/_jsxDEV("div", {
              onClick: () => setSelectedAsset(a),
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem 1rem',
                background: 'rgba(22, 27, 34, 0.4)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background 0.15s'
              },
              className: "list-item",
              children: [/*#__PURE__*/_jsxDEV("span", {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                },
                children: [a.name, /*#__PURE__*/_jsxDEV(Icon, {
                  name: "chevron-right",
                  size: 14,
                  style: {
                    color: '#58a6ff',
                    opacity: 0.7
                  }
                }, void 0, false)]
              }, void 0, true), /*#__PURE__*/_jsxDEV("span", {
                style: {
                  fontWeight: 500
                },
                children: [bal.toLocaleString(), "원"]
              }, void 0, true)]
            }, a.id, true);
          })
        }, void 0, false)]
      }, g.id, true)), groupGrouped.length === 0 && /*#__PURE__*/_jsxDEV("div", {
        style: {
          padding: '2rem',
          textAlign: 'center',
          color: '#8b949e'
        },
        children: "등록된 자산이 없습니다. 설정에서 자산을 추가해주세요."
      }, void 0, false)]
    }, void 0, true)
  }, void 0, false);
}
function AssetModal({
  data,
  setData,
  onClose,
  editItem,
  syncToCloud
}) {
  const [form, setForm] = useState(editItem || {
    name: '',
    ownerId: data.owners[0]?.id || '',
    groupId: data.groups?.[0]?.id || '',
    type: 'Bank',
    initialBalance: 0
  });
  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.ownerId) return;
    const newData = {
      ...data,
      assets: editItem ? data.assets.map(a => a.id === editItem.id ? {
        ...form,
        initialBalance: Number(form.initialBalance || 0)
      } : a) : [...data.assets, {
        ...form,
        id: Date.now().toString(),
        initialBalance: Number(form.initialBalance || 0)
      }]
    };
    setData(newData);
    syncToCloud(newData);
    onClose();
  };
  const handleDelete = () => {
    if (confirm('이 자산을 삭제하시겠습니까? 관련된 거래 내역 표시에 문제가 생길 수 있습니다.')) {
      const newData = {
        ...data,
        assets: data.assets.filter(a => a.id !== editItem.id)
      };
      setData(newData);
      syncToCloud(newData);
      onClose();
    }
  };
  return /*#__PURE__*/_jsxDEV("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "card modal-content",
      style: {
        maxWidth: '420px',
        width: '90%',
        padding: '2rem'
      },
      children: [/*#__PURE__*/_jsxDEV("h2", {
        style: {
          marginBottom: '1.5rem',
          fontSize: '1.5rem'
        },
        children: ["자산 ", editItem ? '수정' : '추가']
      }, void 0, true), /*#__PURE__*/_jsxDEV("form", {
        onSubmit: handleSubmit,
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "form-row",
          children: [/*#__PURE__*/_jsxDEV("label", {
            children: "자산명"
          }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
            value: form.name,
            onChange: e => setForm({
              ...form,
              name: e.target.value
            }),
            required: true
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "form-row",
          children: [/*#__PURE__*/_jsxDEV("label", {
            children: "소유자"
          }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
            value: form.ownerId,
            onChange: e => setForm({
              ...form,
              ownerId: e.target.value
            }),
            required: true,
            children: [/*#__PURE__*/_jsxDEV("option", {
              value: "",
              children: "선택"
            }, void 0, false), data.owners.map(o => /*#__PURE__*/_jsxDEV("option", {
              value: o.id,
              children: o.name
            }, o.id, false))]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "form-row",
          children: [/*#__PURE__*/_jsxDEV("label", {
            children: "그룹"
          }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
            value: form.groupId,
            onChange: e => setForm({
              ...form,
              groupId: e.target.value
            }),
            children: [/*#__PURE__*/_jsxDEV("option", {
              value: "",
              children: "선택 (선택사항)"
            }, void 0, false), (data.groups || []).map(g => /*#__PURE__*/_jsxDEV("option", {
              value: g.id,
              children: g.name
            }, g.id, false))]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "form-row",
          children: [/*#__PURE__*/_jsxDEV("label", {
            children: "자산 유형"
          }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
            value: form.type,
            onChange: e => setForm({
              ...form,
              type: e.target.value
            }),
            children: [/*#__PURE__*/_jsxDEV("option", {
              value: "Cash",
              children: "현금"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "Bank",
              children: "은행"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "Card",
              children: "카드"
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "form-row",
          style: {
            alignItems: 'flex-start'
          },
          children: [/*#__PURE__*/_jsxDEV("label", {
            style: {
              marginTop: '10px'
            },
            children: "초기 잔액"
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            className: "quick-amount-container",
            children: [/*#__PURE__*/_jsxDEV("input", {
              type: "text",
              value: form.initialBalance ? Number(form.initialBalance).toLocaleString() : '',
              onChange: e => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setForm({
                  ...form,
                  initialBalance: val
                });
              },
              placeholder: "금액 입력",
              required: true
            }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
              className: "quick-amount-buttons",
              children: [/*#__PURE__*/_jsxDEV("button", {
                type: "button",
                onClick: () => {
                  const current = Number(form.initialBalance || 0);
                  setForm({
                    ...form,
                    initialBalance: (current + 1000000).toString()
                  });
                },
                children: "백만"
              }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                type: "button",
                onClick: () => {
                  const current = Number(form.initialBalance || 0);
                  setForm({
                    ...form,
                    initialBalance: (current + 100000).toString()
                  });
                },
                children: "십만"
              }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                type: "button",
                onClick: () => {
                  const current = Number(form.initialBalance || 0);
                  setForm({
                    ...form,
                    initialBalance: (current + 10000).toString()
                  });
                },
                children: "만"
              }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                type: "button",
                onClick: () => {
                  const current = Number(form.initialBalance || 0);
                  setForm({
                    ...form,
                    initialBalance: (current + 1000).toString()
                  });
                },
                children: "천"
              }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                type: "button",
                onClick: () => {
                  const current = Number(form.initialBalance || 0);
                  setForm({
                    ...form,
                    initialBalance: (current + 100).toString()
                  });
                },
                children: "백"
              }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                type: "button",
                onClick: () => {
                  const current = Number(form.initialBalance || 0);
                  setForm({
                    ...form,
                    initialBalance: (current + 10).toString()
                  });
                },
                children: "십"
              }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                type: "button",
                className: "clear-btn",
                onClick: () => setForm({
                  ...form,
                  initialBalance: ''
                }),
                children: "지우기"
              }, void 0, false)]
            }, void 0, true)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end',
            marginTop: '1.5rem'
          },
          children: [/*#__PURE__*/_jsxDEV("button", {
            type: "button",
            onClick: onClose,
            style: {
              background: '#30363d',
              color: 'white'
            },
            children: "취소"
          }, void 0, false), editItem && /*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: "danger",
            onClick: handleDelete,
            children: "삭제"
          }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
            type: "submit",
            className: "primary",
            children: "저장"
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true)
  }, void 0, false);
}
function TransactionModal({
  data,
  setData,
  onClose,
  editItem,
  syncToCloud,
  isConnected,
  user
}) {
  const [form, setForm] = useState(() => {
    const groups = data.groups || [];
    const firstGroup = groups.length > 0 ? groups[0].id : '';
    const getTodayKST = () => {
      const now = new Date();
      const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
      return kst.toISOString().split('T')[0];
    };
    const initial = editItem || {
      date: getTodayKST(),
      type: 'Expense',
      amount: '',
      categoryId: '',
      groupId: firstGroup,
      assetId: data.assets[0]?.id || '',
      toGroupId: firstGroup,
      toAssetId: '',
      memo: ''
    };

    // For editing existing records, determine group from asset
    if (editItem) {
      const fromAsset = data.assets.find(a => a.id === editItem.assetId);
      if (fromAsset) initial.groupId = fromAsset.groupId || '';
      if (editItem.type === 'Transfer') {
        const toAsset = data.assets.find(a => a.id === editItem.toAssetId);
        if (toAsset) initial.toGroupId = toAsset.groupId || '';
      }
    }
    return {
      ...initial,
      groupId: initial.groupId || firstGroup,
      toGroupId: initial.toGroupId || firstGroup
    };
  });
  const filteredAssets = data.assets.filter(a => form.groupId ? a.groupId === form.groupId : true);
  const filteredToAssets = data.assets.filter(a => (form.toGroupId ? a.groupId === form.toGroupId : true) && a.id !== form.assetId);
  const filteredCategories = data.categories.filter(c => c.type === form.type);
  useEffect(() => {
    if (filteredAssets.length > 0 && !filteredAssets.find(a => a.id === form.assetId)) setForm(f => ({
      ...f,
      assetId: filteredAssets[0].id
    }));
    if (form.type === 'Transfer' && filteredToAssets.length > 0 && !filteredToAssets.find(a => a.id === form.toAssetId)) {
      setForm(f => ({
        ...f,
        toAssetId: filteredToAssets[0].id
      }));
    }
  }, [form.groupId, form.type, form.toGroupId]);
  const handleSubmit = e => {
    if (e) e.preventDefault();
    if (form.type === 'Transfer' && form.assetId === form.toAssetId) {
      alert('동일 자산 간 이체는 불가합니다.');
      return;
    }
    if (!isConnected) {
      alert('Firebase 서버와 연결되지 않아 저장할 수 없습니다.');
      return;
    }
    const authorEmail = editItem?.authorEmail || user?.email || '';
    const newData = {
      ...data,
      transactions: editItem ? data.transactions.map(t => t.id === editItem.id ? {
        ...form,
        id: editItem.id,
        authorEmail
      } : t) : [...data.transactions, {
        ...form,
        id: Date.now().toString(),
        authorEmail
      }]
    };
    setData(newData);
    syncToCloud(newData);
    onClose();
  };
  const handleDelete = () => {
    if (confirm('이 거래 내역을 삭제하시겠습니까?')) {
      const newData = {
        ...data,
        transactions: data.transactions.filter(t => t.id !== editItem.id)
      };
      setData(newData);
      syncToCloud(newData);
      onClose();
    }
  };
  const handleAmountChange = e => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setForm({
      ...form,
      amount: val
    });
  };
  const handleQuickAmount = val => {
    const current = Number(form.amount || 0);
    setForm({
      ...form,
      amount: (current + val).toString()
    });
  };
  const clearAmount = () => setForm({
    ...form,
    amount: ''
  });
  return /*#__PURE__*/_jsxDEV("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      overflowY: 'auto',
      zIndex: 1000,
      padding: '1rem 0'
    },
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "card modal-content",
      style: {
        maxWidth: '420px',
        width: '90%',
        padding: '2rem',
        margin: 'auto'
      },
      children: [/*#__PURE__*/_jsxDEV("h2", {
        className: "modal-title",
        style: {
          marginBottom: '1.5rem',
          fontSize: '1.5rem'
        },
        children: ["거래 ", editItem ? '수정' : '추가']
      }, void 0, true), !isConnected && /*#__PURE__*/_jsxDEV("div", {
        className: "sync-warning",
        children: [/*#__PURE__*/_jsxDEV(Icon, {
          name: "alert-circle",
          size: 18
        }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
          children: "Firebase에 연동되지 않아 작성이 제한됩니다."
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("form", {
        onSubmit: handleSubmit,
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "form-row",
          children: [/*#__PURE__*/_jsxDEV("label", {
            children: "날짜"
          }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
            type: "date",
            value: form.date,
            onChange: e => setForm({
              ...form,
              date: e.target.value
            }),
            required: true
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "form-row",
          children: [/*#__PURE__*/_jsxDEV("label", {
            children: "구분"
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            className: "type-button-group",
            children: [/*#__PURE__*/_jsxDEV("button", {
              type: "button",
              className: `${form.type === 'Income' ? 'active' : ''} ${!isConnected ? 'btn-disabled' : ''}`,
              "data-type": "Income",
              onClick: () => setForm({
                ...form,
                type: 'Income'
              }),
              children: "수입"
            }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
              type: "button",
              className: `${form.type === 'Expense' ? 'active' : ''} ${!isConnected ? 'btn-disabled' : ''}`,
              "data-type": "Expense",
              onClick: () => setForm({
                ...form,
                type: 'Expense'
              }),
              children: "지출"
            }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
              type: "button",
              className: `${form.type === 'Transfer' ? 'active' : ''} ${!isConnected ? 'btn-disabled' : ''}`,
              "data-type": "Transfer",
              onClick: () => setForm({
                ...form,
                type: 'Transfer'
              }),
              children: "이체"
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "form-row",
          children: [/*#__PURE__*/_jsxDEV("label", {
            children: "카테고리"
          }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
            value: form.categoryId,
            onChange: e => setForm({
              ...form,
              categoryId: e.target.value
            }),
            required: true,
            disabled: !isConnected,
            children: [/*#__PURE__*/_jsxDEV("option", {
              value: "",
              children: "선택하세요"
            }, void 0, false), filteredCategories.map(c => /*#__PURE__*/_jsxDEV("option", {
              value: c.id,
              children: c.name
            }, c.id, false))]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "form-row",
          style: {
            alignItems: 'flex-start'
          },
          children: [/*#__PURE__*/_jsxDEV("label", {
            style: {
              marginTop: '10px'
            },
            children: "금액"
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            className: "quick-amount-container",
            children: [/*#__PURE__*/_jsxDEV("input", {
              type: "text",
              value: form.amount ? Number(form.amount).toLocaleString() : '',
              onChange: handleAmountChange,
              placeholder: "금액 입력",
              required: true,
              disabled: !isConnected
            }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
              className: "quick-amount-buttons",
              children: [/*#__PURE__*/_jsxDEV("button", {
                type: "button",
                onClick: () => handleQuickAmount(1000000),
                disabled: !isConnected,
                children: "백만"
              }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                type: "button",
                onClick: () => handleQuickAmount(100000),
                disabled: !isConnected,
                children: "십만"
              }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                type: "button",
                onClick: () => handleQuickAmount(10000),
                disabled: !isConnected,
                children: "만"
              }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                type: "button",
                onClick: () => handleQuickAmount(1000),
                disabled: !isConnected,
                children: "천"
              }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                type: "button",
                onClick: () => handleQuickAmount(100),
                disabled: !isConnected,
                children: "백"
              }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                type: "button",
                onClick: () => handleQuickAmount(10),
                disabled: !isConnected,
                children: "십"
              }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                type: "button",
                className: "clear-btn",
                onClick: clearAmount,
                disabled: !isConnected,
                children: "지우기"
              }, void 0, false)]
            }, void 0, true)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "form-row",
          children: [/*#__PURE__*/_jsxDEV("label", {
            children: "그룹 (출금)"
          }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
            value: form.groupId,
            onChange: e => setForm({
              ...form,
              groupId: e.target.value
            }),
            disabled: !isConnected,
            children: [/*#__PURE__*/_jsxDEV("option", {
              value: "",
              children: "전체/미지정"
            }, void 0, false), (data.groups || []).map(g => /*#__PURE__*/_jsxDEV("option", {
              value: g.id,
              children: g.name
            }, g.id, false))]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "form-row",
          children: [/*#__PURE__*/_jsxDEV("label", {
            children: form.type === 'Transfer' ? '출금 자산' : '자산'
          }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
            value: form.assetId,
            onChange: e => setForm({
              ...form,
              assetId: e.target.value
            }),
            disabled: !isConnected,
            children: filteredAssets.map(a => /*#__PURE__*/_jsxDEV("option", {
              value: a.id,
              children: a.name
            }, a.id, false))
          }, void 0, false)]
        }, void 0, true), form.type === 'Transfer' && /*#__PURE__*/_jsxDEV(React.Fragment, {
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "form-row",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "그룹 (입금)"
            }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
              value: form.toGroupId,
              onChange: e => setForm({
                ...form,
                toGroupId: e.target.value
              }),
              disabled: !isConnected,
              children: [/*#__PURE__*/_jsxDEV("option", {
                value: "",
                children: "전체/미지정"
              }, void 0, false), (data.groups || []).map(g => /*#__PURE__*/_jsxDEV("option", {
                value: g.id,
                children: g.name
              }, g.id, false))]
            }, void 0, true)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-row",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "입금 자산"
            }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
              value: form.toAssetId,
              onChange: e => setForm({
                ...form,
                toAssetId: e.target.value
              }),
              disabled: !isConnected,
              children: filteredToAssets.map(a => /*#__PURE__*/_jsxDEV("option", {
                value: a.id,
                children: a.name
              }, a.id, false))
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "form-row",
          children: [/*#__PURE__*/_jsxDEV("label", {
            children: "메모"
          }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
            value: form.memo,
            onChange: e => setForm({
              ...form,
              memo: e.target.value
            }),
            placeholder: "메모",
            disabled: !isConnected
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "modal-footer",
          style: {
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end',
            marginTop: '1.5rem'
          },
          children: [/*#__PURE__*/_jsxDEV("button", {
            type: "button",
            onClick: onClose,
            style: {
              background: '#30363d',
              color: 'white'
            },
            children: "취소"
          }, void 0, false), editItem && /*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: "danger",
            onClick: handleDelete,
            disabled: !isConnected,
            children: "삭제"
          }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
            type: "submit",
            className: `primary ${!isConnected ? 'btn-disabled' : ''}`,
            disabled: !isConnected,
            children: "저장"
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true)
  }, void 0, false);
}
function Settings({
  data,
  setData,
  fbConfig,
  setFbConfig,
  syncToCloud,
  user,
  isConnected
}) {
  const [fbVal, setFbVal] = useState(fbConfig ? JSON.stringify(fbConfig, null, 2) : '');
  const [newPw, setNewPw] = useState('');
  const [activeTab, setActiveTab] = useState('general'); // general, owners, groups, categories, assets, authors

  // State for management tabs
  const [newOwner, setNewOwner] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAbbr, setNewAbbr] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [newCat, setNewCat] = useState({
    name: '',
    type: 'Expense'
  });
  const [editingAsset, setEditingAsset] = useState(null);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [tempSharedId, setTempSharedId] = useState(localStorage.getItem(SHARED_ID_KEY) || '');
  const saveFb = () => {
    try {
      const c = JSON.parse(fbVal);
      if (!c.apiKey || !c.projectId) {
        alert('올바른 Firebase 웹 설정 형식이 아닙니다.\n"apiKey"와 "projectId"가 포함된 JSON을 입력해주세요.\n(주의: 서비스 계정 키 파일이 아닙니다)');
        return;
      }
      localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(c));
      setFbConfig(c);
      alert('Firebase 설정이 저장되었습니다. 앱을 다시 시작합니다.');
      location.reload();
    } catch (e) {
      alert('유효한 JSON 형식이 아닙니다.');
    }
  };
  const resetFb = () => {
    if (confirm('서버 설정을 초기화하시겠습니까?')) {
      localStorage.removeItem(FIREBASE_CONFIG_KEY);
      setFbConfig(null);
      alert('설정이 초기화되었습니다.');
      location.reload();
    }
  };
  const changePw = () => {
    if (newPw.length < 4) {
      alert('비밀번호는 4자리 이상이어야 합니다.');
      return;
    }
    localStorage.setItem(PASSWORD_KEY, newPw);
    setNewPw('');
    alert('비밀번호가 변경되었습니다.');
  };
  const saveSharedId = () => {
    if (tempSharedId.trim()) {
      localStorage.setItem(SHARED_ID_KEY, tempSharedId.trim());
      alert('공유 ID가 저장되었습니다. 앱을 다시 시작합니다.');
      location.reload();
    } else {
      localStorage.removeItem(SHARED_ID_KEY);
      alert('공유 ID가 제거되었습니다. 개인 모드로 전환합니다.');
      location.reload();
    }
  };
  const generateSharedId = () => {
    const newId = Math.random().toString(36).substring(2, 10).toUpperCase();
    setTempSharedId(newId);
    alert(`신규 공유 ID가 생성되었습니다: ${newId}\n'저장' 버튼을 눌러야 적용됩니다.`);
  };
  const exportData = () => {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const todayKST = kst.toISOString().split('T')[0];
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `household_backup_${todayKST}.json`;
    a.click();
  };
  const importData = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        if (confirm('데이터를 덮어쓰시겠습니까? 현재 데이터는 사라집니다.')) {
          setData(d);
          syncToCloud(d);
          alert('데이터를 성공적으로 불러왔습니다.');
        }
      } catch (err) {
        alert('잘못된 백업 파일입니다.');
      }
    };
    reader.readAsText(file);
  };

  // Management Functions
  const addOwner = () => {
    if (!newOwner) return;
    const newData = {
      ...data,
      owners: [...data.owners, {
        id: Date.now().toString(),
        name: newOwner
      }]
    };
    setData(newData);
    syncToCloud(newData);
    setNewOwner('');
  };
  const delOwner = id => {
    if (confirm('삭제하시겠습니까?')) {
      const newData = {
        ...data,
        owners: data.owners.filter(o => o.id !== id)
      };
      setData(newData);
      syncToCloud(newData);
    }
  };
  const addGroup = () => {
    if (!newGroup) return;
    const newData = {
      ...data,
      groups: [...(data.groups || []), {
        id: Date.now().toString(),
        name: newGroup
      }]
    };
    setData(newData);
    syncToCloud(newData);
    setNewGroup('');
  };
  const delGroup = id => {
    if (confirm('삭제하시겠습니까?')) {
      const newData = {
        ...data,
        groups: data.groups.filter(g => g.id !== id)
      };
      setData(newData);
      syncToCloud(newData);
    }
  };
  const addCat = () => {
    if (!newCat.name) return;
    const newData = {
      ...data,
      categories: [...data.categories, {
        ...newCat,
        id: Date.now().toString()
      }]
    };
    setData(newData);
    syncToCloud(newData);
    setNewCat({
      ...newCat,
      name: ''
    });
  };
  const delCat = id => {
    if (confirm('삭제하시겠습니까?')) {
      const newData = {
        ...data,
        categories: data.categories.filter(c => c.id !== id)
      };
      setData(newData);
      syncToCloud(newData);
    }
  };
  const addAbbr = () => {
    if (!newEmail || !newAbbr) return;
    const newData = {
      ...data,
      authorAbbreviations: [...(data.authorAbbreviations || []).filter(a => a.email !== newEmail), {
        email: newEmail,
        abbr: newAbbr
      }]
    };
    setData(newData);
    syncToCloud(newData);
    setNewEmail('');
    setNewAbbr('');
  };
  const delAbbr = email => {
    if (confirm('이 약칭을 삭제하시겠습니까?')) {
      const newData = {
        ...data,
        authorAbbreviations: (data.authorAbbreviations || []).filter(a => a.email !== email)
      };
      setData(newData);
      syncToCloud(newData);
    }
  };
  const renderCatList = type => /*#__PURE__*/_jsxDEV("div", {
    style: {
      marginBottom: '1.5rem'
    },
    children: [/*#__PURE__*/_jsxDEV("h4", {
      style: {
        marginBottom: '0.5rem',
        color: '#8b949e'
      },
      children: type === 'Income' ? '수입' : type === 'Expense' ? '지출' : '이체'
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      style: {
        display: 'flex',
        gap: '8px',
        margin: '0.5rem 0'
      },
      children: [/*#__PURE__*/_jsxDEV("input", {
        value: newCat.type === type ? newCat.name : '',
        onChange: e => setNewCat({
          type,
          name: e.target.value
        }),
        placeholder: "카테고리명"
      }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
        className: "primary",
        onClick: () => {
          if (newCat.type === type) addCat();
        },
        children: "추가"
      }, void 0, false)]
    }, void 0, true), data.categories.filter(c => c.type === type).map(c => /*#__PURE__*/_jsxDEV("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid #30363d'
      },
      children: [c.name, " ", /*#__PURE__*/_jsxDEV("button", {
        onClick: () => delCat(c.id),
        style: {
          background: 'transparent',
          color: '#da3633',
          fontSize: '0.8rem'
        },
        children: "삭제"
      }, void 0, false)]
    }, c.id, true))]
  }, void 0, true);
  return /*#__PURE__*/_jsxDEV("div", {
    className: "fade-in",
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "card",
      style: {
        padding: 0,
        overflow: 'hidden',
        marginBottom: '1.5rem'
      },
      children: [/*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          borderBottom: '1px solid #30363d',
          background: 'rgba(22, 27, 34, 0.5)',
          overflowX: 'auto'
        },
        children: [{
          id: 'general',
          label: '일반/백업'
        }, {
          id: 'owners',
          label: '소유자'
        }, {
          id: 'groups',
          label: '자산 그룹'
        }, {
          id: 'assets',
          label: '자산 목록'
        }, {
          id: 'categories',
          label: '카테고리'
        }, {
          id: 'authors',
          label: '작성자 약칭'
        }].map(t => /*#__PURE__*/_jsxDEV("button", {
          onClick: () => setActiveTab(t.id),
          style: {
            padding: '1rem 1.5rem',
            background: 'transparent',
            color: activeTab === t.id ? '#58a6ff' : '#8b949e',
            borderBottom: activeTab === t.id ? '2px solid #58a6ff' : '2px solid transparent',
            borderRadius: 0,
            whiteSpace: 'nowrap'
          },
          children: t.label
        }, t.id, false))
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        style: {
          padding: '1.5rem'
        },
        children: [activeTab === 'general' && /*#__PURE__*/_jsxDEV("div", {
          className: "dashboard-grid",
          children: [/*#__PURE__*/_jsxDEV("div", {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            },
            children: [/*#__PURE__*/_jsxDEV("div", {
              children: [/*#__PURE__*/_jsxDEV("h3", {
                children: "🔑 비밀번호 변경"
              }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
                style: {
                  display: 'flex',
                  gap: '8px',
                  margin: '1rem 0'
                },
                children: [/*#__PURE__*/_jsxDEV("input", {
                  type: "password",
                  value: newPw,
                  onChange: e => setNewPw(e.target.value),
                  placeholder: "새 비밀번호 입력"
                }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                  className: "primary",
                  onClick: changePw,
                  children: "변경"
                }, void 0, false)]
              }, void 0, true)]
            }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
              style: {
                borderTop: '1px solid #30363d',
                paddingTop: '1.5rem'
              },
              children: [/*#__PURE__*/_jsxDEV("h3", {
                children: "🔗 데이터 공유 설정 (공유 ID)"
              }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
                style: {
                  color: '#8b949e',
                  fontSize: '0.85rem',
                  marginBottom: '0.5rem'
                },
                children: "동일한 공유 ID를 입력한 계정끼리 데이터가 실시간으로 연동됩니다."
              }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
                style: {
                  display: 'flex',
                  gap: '8px',
                  margin: '0.5rem 0'
                },
                children: [/*#__PURE__*/_jsxDEV("input", {
                  value: tempSharedId,
                  onChange: e => setTempSharedId(e.target.value),
                  placeholder: "공유 ID 입력"
                }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                  className: "primary",
                  onClick: saveSharedId,
                  children: "저장"
                }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                  onClick: generateSharedId,
                  style: {
                    background: '#30363d',
                    color: 'white'
                  },
                  children: "생성"
                }, void 0, false)]
              }, void 0, true), tempSharedId === (localStorage.getItem(SHARED_ID_KEY) || '') && tempSharedId && /*#__PURE__*/_jsxDEV("p", {
                style: {
                  color: '#238636',
                  fontSize: '0.8rem'
                },
                children: "현재 공유 모드 활성화 중"
              }, void 0, false)]
            }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
              style: {
                borderTop: '1px solid #30363d',
                paddingTop: '1.5rem'
              },
              children: [/*#__PURE__*/_jsxDEV("h3", {
                children: "💾 데이터 백업 및 복구"
              }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
                style: {
                  display: 'flex',
                  gap: '12px',
                  marginTop: '1rem'
                },
                children: [/*#__PURE__*/_jsxDEV("button", {
                  onClick: exportData,
                  style: {
                    background: '#30363d',
                    color: 'white',
                    flex: 1
                  },
                  children: [/*#__PURE__*/_jsxDEV(Icon, {
                    name: "download",
                    size: 16
                  }, void 0, false), " JSON 저장"]
                }, void 0, true), /*#__PURE__*/_jsxDEV("label", {
                  className: "auth-btn login",
                  style: {
                    textAlign: 'center',
                    cursor: 'pointer',
                    margin: 0,
                    flex: 1
                  },
                  children: [/*#__PURE__*/_jsxDEV(Icon, {
                    name: "upload",
                    size: 16
                  }, void 0, false), " 복구 ", /*#__PURE__*/_jsxDEV("input", {
                    type: "file",
                    accept: ".json",
                    onChange: importData,
                    style: {
                      display: 'none'
                    }
                  }, void 0, false)]
                }, void 0, true)]
              }, void 0, true)]
            }, void 0, true)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            children: [/*#__PURE__*/_jsxDEV("h3", {
              children: "☁️ 서버 연동 (Firebase)"
            }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
              style: {
                color: '#8b949e',
                fontSize: '0.85rem',
                marginBottom: '0.5rem'
              },
              children: "Firebase 프로젝트 \"웹 앱\" 구성 JSON을 입력하세요."
            }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
              style: {
                background: 'rgba(255, 165, 0, 0.1)',
                padding: '8px',
                borderRadius: '6px',
                marginBottom: '1rem',
                border: '1px solid rgba(255, 165, 0, 0.3)'
              },
              children: /*#__PURE__*/_jsxDEV("p", {
                style: {
                  color: '#ffa500',
                  fontSize: '0.78rem'
                },
                children: ["⚠️ ", /*#__PURE__*/_jsxDEV("b", {
                  children: "주의"
                }, void 0, false), ": ", /*#__PURE__*/_jsxDEV("code", {
                  children: "private_key"
                }, void 0, false), "가 들어있는 ", /*#__PURE__*/_jsxDEV("b", {
                  children: "서비스 계정 JSON"
                }, void 0, false), "이 아닌, ", /*#__PURE__*/_jsxDEV("code", {
                  children: "apiKey"
                }, void 0, false), "가 포함된 ", /*#__PURE__*/_jsxDEV("b", {
                  children: "웹 앱 설정"
                }, void 0, false), " 객체를 입력해야 합니다."]
              }, void 0, true)
            }, void 0, false), fbConfig && !user && /*#__PURE__*/_jsxDEV("div", {
              style: {
                background: 'rgba(56, 139, 253, 0.15)',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '1rem',
                border: '1px solid #388bfd'
              },
              children: [/*#__PURE__*/_jsxDEV("p", {
                style: {
                  color: '#58a6ff',
                  fontSize: '0.85rem',
                  fontWeight: 'bold'
                },
                children: "💡 설정 저장 완료! 이제 로그인을 해주세요."
              }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
                style: {
                  color: '#8b949e',
                  fontSize: '0.75rem',
                  marginTop: '4px'
                },
                children: ["Firebase 연동을 위해서는 구글 로그인이 필요합니다. 좌측 하단(모바일은 메뉴 내)의 ", /*#__PURE__*/_jsxDEV("b", {
                  children: "로그인"
                }, void 0, false), " 버튼을 눌러주세요."]
              }, void 0, true)]
            }, void 0, true), isConnected && /*#__PURE__*/_jsxDEV("div", {
              style: {
                background: 'rgba(35, 134, 54, 0.15)',
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '1rem',
                border: '1px solid #238636'
              },
              children: /*#__PURE__*/_jsxDEV("p", {
                style: {
                  color: '#3fb950',
                  fontSize: '0.85rem'
                },
                children: "✅ Firebase 실시간 연동 중입니다."
              }, void 0, false)
            }, void 0, false), /*#__PURE__*/_jsxDEV("textarea", {
              value: fbVal,
              onChange: e => setFbVal(e.target.value),
              rows: "8",
              placeholder: "{\"apiKey\": \"...\", \"authDomain\": \"...\", ...}",
              style: {
                width: '100%',
                marginBottom: '1rem',
                background: '#0d1117',
                color: '#8b949e',
                padding: '10px',
                fontSize: '13px',
                fontFamily: 'monospace'
              }
            }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
              style: {
                display: 'flex',
                gap: '8px',
                marginBottom: '1.5rem'
              },
              children: [/*#__PURE__*/_jsxDEV("button", {
                className: "primary",
                onClick: saveFb,
                children: "저장"
              }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                onClick: resetFb,
                style: {
                  background: '#30363d',
                  color: 'white'
                },
                children: "기본값으로 초기화"
              }, void 0, false)]
            }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
              style: {
                borderTop: '1px solid #30363d',
                paddingTop: '1rem'
              },
              children: [/*#__PURE__*/_jsxDEV("h4", {
                children: "🛠️ Firestore 보안 규칙 가이드"
              }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
                style: {
                  color: '#8b949e',
                  fontSize: '0.8rem',
                  marginTop: '0.5rem'
                },
                children: "연동이 안 된다면 Firebase 콘솔의 Rules 탭에서 아래와 같이 설정했는지 확인하세요:"
              }, void 0, false), /*#__PURE__*/_jsxDEV("pre", {
                style: {
                  background: '#0d1117',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  color: '#8b949e',
                  marginTop: '8px',
                  overflowX: 'auto'
                },
                children: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /shared_data/{sharedId} {
      allow read, write: if request.auth != null;
    }
  }
}`
              }, void 0, false)]
            }, void 0, true)]
          }, void 0, true)]
        }, void 0, true), activeTab === 'authors' && /*#__PURE__*/_jsxDEV("div", {
          children: [/*#__PURE__*/_jsxDEV("h3", {
            children: "작성자 약칭 관리"
          }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
            style: {
              color: '#8b949e',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            },
            children: "거래내역 필터에 표시될 이메일별 약칭을 설정합니다."
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            style: {
              display: 'flex',
              gap: '8px',
              margin: '1rem 0',
              maxWidth: '500px'
            },
            children: [/*#__PURE__*/_jsxDEV("select", {
              value: newEmail,
              onChange: e => setNewEmail(e.target.value),
              style: {
                padding: '8px',
                borderRadius: '6px',
                background: '#0d1117',
                color: 'white',
                border: '1px solid #30363d',
                flex: 1
              },
              children: [/*#__PURE__*/_jsxDEV("option", {
                value: "",
                children: "이메일 선택"
              }, void 0, false), Array.from(new Set(data.transactions.map(t => t.authorEmail).filter(Boolean))).map(email => /*#__PURE__*/_jsxDEV("option", {
                value: email,
                children: email
              }, email, false))]
            }, void 0, true), /*#__PURE__*/_jsxDEV("input", {
              value: newAbbr,
              onChange: e => setNewAbbr(e.target.value),
              placeholder: "약칭 (예: TS)",
              style: {
                width: '100px'
              }
            }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
              className: "primary",
              onClick: addAbbr,
              children: "추가"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            style: {
              maxWidth: '500px'
            },
            children: (data.authorAbbreviations || []).map(a => /*#__PURE__*/_jsxDEV("div", {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #30363d'
              },
              children: [/*#__PURE__*/_jsxDEV("span", {
                children: [a.email, " ", /*#__PURE__*/_jsxDEV("span", {
                  style: {
                    color: '#58a6ff',
                    marginLeft: '10px'
                  },
                  children: ["[", a.abbr, "]"]
                }, void 0, true)]
              }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
                onClick: () => delAbbr(a.email),
                style: {
                  background: 'transparent',
                  color: '#da3633',
                  fontSize: '0.85rem'
                },
                children: "삭제"
              }, void 0, false)]
            }, a.email, true))
          }, void 0, false)]
        }, void 0, true), activeTab === 'owners' && /*#__PURE__*/_jsxDEV("div", {
          children: [/*#__PURE__*/_jsxDEV("h3", {
            children: "소유자 관리"
          }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
            style: {
              color: '#8b949e',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            },
            children: "자산을 소유하는 구성원을 등록합니다."
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            style: {
              display: 'flex',
              gap: '8px',
              margin: '1rem 0',
              maxWidth: '400px'
            },
            children: [/*#__PURE__*/_jsxDEV("input", {
              value: newOwner,
              onChange: e => setNewOwner(e.target.value),
              placeholder: "이름"
            }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
              className: "primary",
              onClick: addOwner,
              children: "추가"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            style: {
              maxWidth: '400px'
            },
            children: data.owners.map(o => /*#__PURE__*/_jsxDEV("div", {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #30363d'
              },
              children: [o.name, " ", /*#__PURE__*/_jsxDEV("button", {
                onClick: () => delOwner(o.id),
                style: {
                  background: 'transparent',
                  color: '#da3633',
                  fontSize: '0.85rem'
                },
                children: "삭제"
              }, void 0, false)]
            }, o.id, true))
          }, void 0, false)]
        }, void 0, true), activeTab === 'groups' && /*#__PURE__*/_jsxDEV("div", {
          children: [/*#__PURE__*/_jsxDEV("h3", {
            children: "자산 그룹 관리"
          }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
            style: {
              color: '#8b949e',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            },
            children: "자산을 논리적으로 묶어주는 그룹을 등록합니다."
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            style: {
              display: 'flex',
              gap: '8px',
              margin: '1rem 0',
              maxWidth: '400px'
            },
            children: [/*#__PURE__*/_jsxDEV("input", {
              value: newGroup,
              onChange: e => setNewGroup(e.target.value),
              placeholder: "그룹명"
            }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
              className: "primary",
              onClick: addGroup,
              children: "추가"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            style: {
              maxWidth: '400px'
            },
            children: (data.groups || []).map(g => /*#__PURE__*/_jsxDEV("div", {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #30363d'
              },
              children: [g.name, " ", /*#__PURE__*/_jsxDEV("button", {
                onClick: () => delGroup(g.id),
                style: {
                  background: 'transparent',
                  color: '#da3633',
                  fontSize: '0.85rem'
                },
                children: "삭제"
              }, void 0, false)]
            }, g.id, true))
          }, void 0, false)]
        }, void 0, true), activeTab === 'categories' && /*#__PURE__*/_jsxDEV("div", {
          className: "dashboard-grid",
          children: [/*#__PURE__*/_jsxDEV("div", {
            children: renderCatList('Expense')
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            children: renderCatList('Income')
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            children: renderCatList('Transfer')
          }, void 0, false)]
        }, void 0, true), activeTab === 'assets' && /*#__PURE__*/_jsxDEV("div", {
          children: [/*#__PURE__*/_jsxDEV("div", {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            },
            children: [/*#__PURE__*/_jsxDEV("h3", {
              children: "자산 목록 및 관리"
            }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
              className: "primary",
              onClick: () => {
                setEditingAsset(null);
                setShowAssetModal(true);
              },
              children: "+ 자산 추가"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            style: {
              overflowX: 'auto'
            },
            children: /*#__PURE__*/_jsxDEV("table", {
              children: [/*#__PURE__*/_jsxDEV("thead", {
                children: /*#__PURE__*/_jsxDEV("tr", {
                  children: [/*#__PURE__*/_jsxDEV("th", {
                    children: "자산명"
                  }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                    children: "소유자"
                  }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                    children: "그룹"
                  }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                    children: "유형"
                  }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                    children: "초기금액"
                  }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                    children: "현재금액"
                  }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                    children: "관리"
                  }, void 0, false)]
                }, void 0, true)
              }, void 0, false), /*#__PURE__*/_jsxDEV("tbody", {
                children: [data.assets.map(a => {
                  const bal = data.transactions.reduce((s, t) => {
                    const amt = Number(t.amount || 0);
                    if (t.type === 'Income' && t.assetId === a.id) return s + amt;
                    if (t.type === 'Expense' && t.assetId === a.id) return s - amt;
                    if (t.type === 'Transfer') {
                      if (t.assetId === a.id) return s - amt;
                      if (t.toAssetId === a.id) return s + amt;
                    }
                    return s;
                  }, Number(a.initialBalance || 0));
                  return /*#__PURE__*/_jsxDEV("tr", {
                    children: [/*#__PURE__*/_jsxDEV("td", {
                      style: {
                        fontWeight: 500
                      },
                      children: a.name
                    }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                      children: data.owners.find(o => o.id === a.ownerId)?.name
                    }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                      children: data.groups?.find(g => g.id === a.groupId)?.name || '-'
                    }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                      children: a.type === 'Cash' ? '현금' : a.type === 'Bank' ? '은행' : '카드'
                    }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                      style: {
                        color: '#8b949e'
                      },
                      children: Number(a.initialBalance || 0).toLocaleString()
                    }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                      style: {
                        fontWeight: 600,
                        color: '#58a6ff'
                      },
                      children: bal.toLocaleString()
                    }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                      children: /*#__PURE__*/_jsxDEV("button", {
                        onClick: () => {
                          setEditingAsset(a);
                          setShowAssetModal(true);
                        },
                        style: {
                          background: 'transparent',
                          color: '#58a6ff',
                          padding: '0.3rem'
                        },
                        children: "수정"
                      }, void 0, false)
                    }, void 0, false)]
                  }, a.id, true);
                }), data.assets.length === 0 && /*#__PURE__*/_jsxDEV("tr", {
                  children: /*#__PURE__*/_jsxDEV("td", {
                    colSpan: "7",
                    style: {
                      textAlign: 'center',
                      padding: '2rem'
                    },
                    children: "등록된 자산이 없습니다."
                  }, void 0, false)
                }, void 0, false)]
              }, void 0, true)]
            }, void 0, true)
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true), showAssetModal && /*#__PURE__*/_jsxDEV(AssetModal, {
      data: data,
      setData: setData,
      onClose: () => setShowAssetModal(false),
      editItem: editingAsset,
      syncToCloud: syncToCloud
    }, void 0, false)]
  }, void 0, true);
}
function App() {
  const [data, setData] = useState(() => {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return initialData;
    const p = JSON.parse(s);
    if (!p.categories || p.categories.length < 10) p.categories = initialData.categories;
    if (!p.groups) p.groups = initialData.groups;
    if (p.assets) p.assets = p.assets.map(a => ({
      ...a,
      initialBalance: a.initialBalance !== undefined ? a.initialBalance : 0,
      groupId: a.groupId || ''
    }));
    return p;
  });
  const [user, setUser] = useState(null);
  const [fbConfig, setFbConfig] = useState(() => JSON.parse(localStorage.getItem(FIREBASE_CONFIG_KEY) || 'null'));
  const [tab, setTab] = useState('transactions');
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [authorFilter, setAuthorFilter] = useState('ALL');

  // For Dashboard Asset editing
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const isConnected = useMemo(() => {
    return !!user && !!fbConfig && window.firebase && firebase.apps.length > 0;
  }, [user, fbConfig]);
  const syncToCloud = newData => {
    if (user && window.firebase && firebase.apps.length) {
      const sharedId = localStorage.getItem(SHARED_ID_KEY);
      const docRef = sharedId ? firebase.firestore().collection('shared_data').doc(sharedId) : firebase.firestore().collection('users').doc(user.uid);
      docRef.set(newData).catch(err => console.error("Firebase Sync Error:", err));
    }
  };
  useEffect(() => {
    if (!fbConfig || !window.firebase) return;
    if (!firebase.apps.length) firebase.initializeApp(fbConfig);
    let unsubSnapshot = null;
    const unsubscribeAuth = firebase.auth().onAuthStateChanged(u => {
      setUser(u);
      if (unsubSnapshot) {
        unsubSnapshot();
        unsubSnapshot = null;
      }
      if (u) {
        const sharedId = localStorage.getItem(SHARED_ID_KEY);
        const docRef = sharedId ? firebase.firestore().collection('shared_data').doc(sharedId) : firebase.firestore().collection('users').doc(u.uid);
        unsubSnapshot = docRef.onSnapshot(d => {
          if (!d.exists) {
            // 클라우드에 데이터가 없으면 최초 1회 로컬 데이터를 업로드
            const currentLocalData = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(initialData));
            docRef.set(currentLocalData).catch(err => console.error("Initial Sync Fail:", err));
            setData(currentLocalData);
          } else {
            const cloudData = d.data();
            // 클라우드 데이터를 기준으로 상태 업데이트 (Source of Truth)
            setData(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(cloudData)) {
                return cloudData;
              }
              return prev;
            });
          }
        }, err => {
          console.error("Firebase Snapshot Error:", err);
          if (err.code === 'permission-denied') {
            alert("Firebase 권한 오류: Firestore 보안 규칙을 확인해주세요.");
          } else {
            alert("Firebase 연동 오류: " + err.message);
          }
        });
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, [fbConfig]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (window.lucide) window.lucide.createIcons();
  }, [data]);
  const menuClick = t => {
    if (t === 'settings') {
      const pw = prompt('설정 페이지에 진입하려면 비밀번호를 입력하세요.');
      const storedPw = localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
      if (pw !== storedPw) {
        alert('비밀번호가 올바르지 않습니다.');
        return;
      }
    }
    setTab(t);
    setSidebarOpen(false);
  };
  const tabTitles = {
    dashboard: '대시보드',
    transactions: '거래 내역',
    assets: '자산 현황',
    settings: '설정'
  };
  return /*#__PURE__*/_jsxDEV(React.Fragment, {
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "mobile-header",
      children: [/*#__PURE__*/_jsxDEV("button", {
        onClick: () => setSidebarOpen(true),
        style: {
          background: 'transparent',
          color: 'white',
          padding: '0.4rem'
        },
        children: /*#__PURE__*/_jsxDEV(Icon, {
          name: "menu",
          size: 24
        }, void 0, false)
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: 1
        },
        children: [/*#__PURE__*/_jsxDEV(Icon, {
          name: tab === 'dashboard' ? 'layout-dashboard' : tab === 'transactions' ? 'list' : tab === 'assets' ? 'wallet' : 'settings',
          size: 24,
          className: "mobile-hide"
        }, void 0, false), /*#__PURE__*/_jsxDEV("h2", {
          children: tabTitles[tab] || 'Smart Finance'
        }, void 0, false), tab === 'transactions' && /*#__PURE__*/_jsxDEV("select", {
          className: "mobile-only",
          value: authorFilter,
          onChange: e => setAuthorFilter(e.target.value),
          style: {
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #30363d',
            background: '#21262d',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            marginLeft: 'auto',
            maxWidth: '80px'
          },
          children: [/*#__PURE__*/_jsxDEV("option", {
            value: "ALL",
            children: "전체"
          }, void 0, false), Array.from(new Set((data.transactions || []).map(t => t.authorEmail).filter(Boolean))).map(email => {
            const abbrs = data.authorAbbreviations || [];
            const found = abbrs.find(a => a.email === email);
            const label = found ? found.abbr : email;
            return /*#__PURE__*/_jsxDEV("option", {
              value: email,
              children: label
            }, email, false);
          })]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: `connection-status ${isConnected ? 'connected' : 'disconnected'}`,
          style: {
            marginLeft: tab === 'transactions' ? '4px' : 'auto'
          },
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "connection-dot"
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            className: "mobile-hide",
            children: isConnected ? '연동됨' : '미연동'
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true), tab === 'transactions' && /*#__PURE__*/_jsxDEV("button", {
        className: "mobile-only",
        onClick: () => setShowMobileSearch(!showMobileSearch),
        style: {
          background: 'transparent',
          color: 'white',
          padding: '0.4rem',
          marginRight: '4px'
        },
        children: /*#__PURE__*/_jsxDEV(Icon, {
          name: "search",
          size: 20
        }, void 0, false)
      }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
        onClick: () => location.reload(),
        style: {
          background: 'transparent',
          color: 'white',
          padding: '0.4rem'
        },
        children: /*#__PURE__*/_jsxDEV(Icon, {
          name: "refresh-cw",
          size: 24
        }, void 0, false)
      }, void 0, false)]
    }, void 0, true), tab === 'transactions' && showMobileSearch && /*#__PURE__*/_jsxDEV("div", {
      className: "mobile-only fade-in",
      style: {
        background: '#21262d',
        padding: '10px 15px',
        borderBottom: '1px solid #30363d',
        display: 'flex',
        position: 'sticky',
        top: '53px',
        zIndex: 999,
        width: '100%',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
      },
      children: /*#__PURE__*/_jsxDEV("div", {
        style: {
          position: 'relative',
          flex: 1
        },
        children: [/*#__PURE__*/_jsxDEV(Icon, {
          name: "search",
          size: 16,
          style: {
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#8b949e'
          }
        }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
          type: "text",
          value: searchTerm,
          onChange: e => setSearchTerm(e.target.value),
          placeholder: "검색어 입력...",
          style: {
            width: '100%',
            padding: '8px 10px 8px 32px',
            borderRadius: '6px',
            border: '1px solid #30363d',
            background: '#0d1117',
            color: 'white'
          }
        }, void 0, false), searchTerm && /*#__PURE__*/_jsxDEV("button", {
          onClick: () => setSearchTerm(''),
          style: {
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            color: '#8b949e',
            padding: 0
          },
          children: /*#__PURE__*/_jsxDEV(Icon, {
            name: "x",
            size: 14
          }, void 0, false)
        }, void 0, false)]
      }, void 0, true)
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: `mobile-overlay ${sidebarOpen ? 'visible' : ''}`,
      onClick: () => setSidebarOpen(false)
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: `sidebar ${sidebarOpen ? 'mobile-open' : ''}`,
      children: [/*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        },
        children: [/*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          },
          children: [/*#__PURE__*/_jsxDEV(Icon, {
            name: "activity",
            size: 24
          }, void 0, false), /*#__PURE__*/_jsxDEV("h2", {
            children: "Smart Finance"
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
          className: "mobile-only",
          onClick: () => setSidebarOpen(false),
          style: {
            background: 'transparent',
            color: 'white',
            display: window.innerWidth <= 768 ? 'block' : 'none'
          },
          children: /*#__PURE__*/_jsxDEV(Icon, {
            name: "x",
            size: 24
          }, void 0, false)
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        style: {
          marginBottom: '1rem',
          padding: '0 0.5rem'
        },
        children: /*#__PURE__*/_jsxDEV("div", {
          className: `connection-status ${isConnected ? 'connected' : 'disconnected'}`,
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "connection-dot"
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            children: isConnected ? 'Firebase 클라우드 연동 중' : '서버 연결 안 됨 (작성 제한됨)'
          }, void 0, false)]
        }, void 0, true)
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        className: `nav-item ${tab === 'dashboard' ? 'active' : ''}`,
        onClick: () => menuClick('dashboard'),
        children: [/*#__PURE__*/_jsxDEV(Icon, {
          name: "layout-dashboard"
        }, void 0, false), " 대시보드"]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: `nav-item ${tab === 'transactions' ? 'active' : ''}`,
        onClick: () => menuClick('transactions'),
        children: [/*#__PURE__*/_jsxDEV(Icon, {
          name: "list"
        }, void 0, false), " 거래 내역"]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: `nav-item ${tab === 'assets' ? 'active' : ''}`,
        onClick: () => menuClick('assets'),
        children: [/*#__PURE__*/_jsxDEV(Icon, {
          name: "wallet"
        }, void 0, false), " 자산 현황"]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: `nav-item ${tab === 'settings' ? 'active' : ''}`,
        onClick: () => menuClick('settings'),
        children: [/*#__PURE__*/_jsxDEV(Icon, {
          name: "settings"
        }, void 0, false), " 설정"]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "user-profile",
        children: user ? /*#__PURE__*/_jsxDEV("button", {
          onClick: () => firebase.auth().signOut(),
          className: "auth-btn",
          style: {
            background: 'transparent',
            color: '#8b949e'
          },
          children: [/*#__PURE__*/_jsxDEV(Icon, {
            name: "log-out",
            size: 16
          }, void 0, false), " 로그아웃"]
        }, void 0, true) : /*#__PURE__*/_jsxDEV("button", {
          className: "auth-btn login",
          onClick: () => {
            if (!fbConfig) setTab('settings');else firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
          },
          children: [/*#__PURE__*/_jsxDEV(Icon, {
            name: "log-in",
            size: 16
          }, void 0, false), " 로그인"]
        }, void 0, true)
      }, void 0, false)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "main-content",
      children: /*#__PURE__*/_jsxDEV("div", {
        className: "container",
        children: [tab === 'dashboard' && /*#__PURE__*/_jsxDEV(Dashboard, {
          data: data,
          setEdit: setEdit,
          setShowModal: setShowModal,
          setEditAsset: setEditAsset,
          setShowAssetModal: setShowAssetModal
        }, void 0, false), tab === 'transactions' && /*#__PURE__*/_jsxDEV(TransactionPage, {
          data: data,
          setData: setData,
          setEdit: setEdit,
          setShowModal: setShowModal,
          syncToCloud: syncToCloud,
          searchTerm: searchTerm,
          setSearchTerm: setSearchTerm,
          isConnected: isConnected,
          authorFilter: authorFilter,
          setAuthorFilter: setAuthorFilter
        }, void 0, false), tab === 'assets' && /*#__PURE__*/_jsxDEV(AssetManagementPage, {
          data: data,
          setEdit: setEdit,
          setShowModal: setShowModal
        }, void 0, false), tab === 'settings' && /*#__PURE__*/_jsxDEV(Settings, {
          data: data,
          setData: setData,
          fbConfig: fbConfig,
          setFbConfig: setFbConfig,
          syncToCloud: syncToCloud,
          user: user,
          isConnected: isConnected
        }, void 0, false)]
      }, void 0, true)
    }, void 0, false), showModal && /*#__PURE__*/_jsxDEV(TransactionModal, {
      data: data,
      setData: setData,
      onClose: () => {
        setShowModal(false);
        setEdit(null);
      },
      editItem: edit,
      syncToCloud: syncToCloud,
      isConnected: isConnected,
      user: user
    }, void 0, false), showAssetModal && /*#__PURE__*/_jsxDEV(AssetModal, {
      data: data,
      setData: setData,
      onClose: () => {
        setShowAssetModal(false);
        setEditAsset(null);
      },
      editItem: editAsset,
      syncToCloud: syncToCloud
    }, void 0, false)]
  }, void 0, true);
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/_jsxDEV(App, {}, void 0, false));

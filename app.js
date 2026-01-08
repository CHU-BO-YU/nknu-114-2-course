/**
 * NKNU 排課系統 - 核心功能
 */

// ========================================
// 全域變數
// ========================================

let allCourses = [];
let selectedCourses = [];
let courseColorMap = new Map();
let colorIndex = 0;

// 節次時間對照表
const PERIOD_TIMES = {
    '1': '08:10-09:00',
    '2': '09:10-10:00',
    '3': '10:10-11:00',
    '4': '11:10-12:00',
    '5': '13:10-14:00',
    '6': '14:10-15:00',
    '7': '15:10-16:00',
    '8': '16:10-17:00',
    '9': '17:10-18:00',
    'T': '18:30-19:20',
    'A': '19:20-20:10',
    'B': '20:20-21:10',
    'C': '21:10-22:00'
};

// 節次順序（用於課表顯示）
const PERIOD_ORDER = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'A', 'B', 'C'];

// 星期對照
const DAY_NAMES = ['', '週一', '週二', '週三', '週四', '週五', '週六', '週日'];

// ========================================
// 初始化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initScheduleTable();
    loadCourses();
    bindEvents();
});

function initScheduleTable() {
    const tbody = document.getElementById('schedule-body');
    tbody.innerHTML = '';

    PERIOD_ORDER.forEach(period => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="time-col">
                <strong>第${period}節</strong><br>
                <small>${PERIOD_TIMES[period] || ''}</small>
            </td>
            <td data-day="1" data-period="${period}"></td>
            <td data-day="2" data-period="${period}"></td>
            <td data-day="3" data-period="${period}"></td>
            <td data-day="4" data-period="${period}"></td>
            <td data-day="5" data-period="${period}"></td>
        `;
        tbody.appendChild(row);
    });
}

async function loadCourses() {
    try {
        const response = await fetch('data/courses.json');
        if (!response.ok) throw new Error('無法載入課程資料');

        allCourses = await response.json();
        console.log(`已載入 ${allCourses.length} 門課程`);

        populateDepartmentSelect();
    } catch (error) {
        console.error('載入課程失敗:', error);
        document.getElementById('course-list').innerHTML =
            `<p class="placeholder-text">載入課程資料失敗，請確認 data/courses.json 存在</p>`;
    }
}

function populateDepartmentSelect(degree = '') {
    const select = document.getElementById('department-select');
    // 先清空現有選項
    select.innerHTML = '<option value="">-- 請選擇系所 --</option>';

    // 取得所有不重複的系所，按名稱排序
    let departments = [...new Set(allCourses.map(c => c.department))].sort();

    // 如果有指定學制，則先過濾系所
    if (degree) {
        departments = departments.filter(d => matchDegree(d, degree));
    }

    // 定義精確的分類規則 (依據學校系統)
    const collegeMap = {
        '文學院': [
            '國文學系', '國文學系碩士班', '國文學系博士班',
            '英語學系', '英語學系碩士班', '英語學系博士班',
            '地理學系', '地理學系碩士班', '地理學系博士班',
            '臺灣歷史文化及語言研究所碩士班', '經學研究所碩士班',
            '華語文教學研究所碩士班', '華語文教學博士學位學程',
            '客家文化研究所', '語言與文化學士原住民專班', '文學院課程'
        ],
        '理學院': [
            '數學系數學組', '數學系應用數學組', '數學系碩士班',
            '物理學系', '物理學系碩士班', '物理學系博士班',
            '化學系', '化學系碩士班',
            '生物科技系', '生物科技系碩士班',
            '科學教育暨環境教育研究所碩士班', '科學教育暨環境教育研究所科學教育博士班',
            '理學院課程'
        ],
        '教育學院': [
            '教育學系', '教育學系碩士班', '教育學系博士班',
            '特殊教育學系', '特殊教育學系特殊教育碩士班', '特殊教育學系特殊教育博士班',
            '特殊教育學系聽力學與語言治療碩士班語言治療組', '特殊教育學系聽力學與語言治療碩士班聽力學組',
            '體育學系', '體育學系碩士班',
            '成人教育研究所碩士班', '成人教育研究所博士班',
            '性別教育研究所碩士班', '性別教育博士學位學程',
            '諮商心理與復健諮商研究所碩士班諮商心理組', '諮商心理與復健諮商研究所碩士班復健諮商組', '諮商心理與復健諮商研究所諮商心理博士班',
            '運動競技與產業學士原住民專班', '教育學院課程'
        ],
        '科技學院': [
            '工業科技教育學系科技教育與訓練組', '工業科技教育學系能源與冷凍空調組',
            '工業科技教育學系碩士班', '工業科技教育學系博士班',
            '工業設計學系', '工業設計學系碩士班',
            '電子工程學系', '電子工程學系碩士班',
            '電機工程學系', '電機工程學系碩士班',
            '軟體工程與管理學系', '軟體工程與管理學系碩士班工程組', '軟體工程與管理學系碩士班管理組',
            '工程國際碩士學位學程'
        ],
        '藝術學院': [
            '美術學系', '美術學系碩士班',
            '音樂學系', '音樂學系碩士班',
            '視覺設計學系', '視覺設計學系碩士班',
            '跨領域藝術研究所',
            '藝術產業學士原住民專班'
        ],
        '管理學院': [
            '事業經營學系', '事業經營學系碩士班',
            '人力與知識管理研究所'
        ],
        '通識/體育/軍訓': [
            '通識（和平校區）', '通識（燕巢校區）',
            '體育（和平校區）', '體育（燕巢校區）',
            '軍訓（選修）'
        ],
        '學程/專長': [
            '中等教師教育學程', '小學教師教育學程', '特教學程資優類',
            '文化學程', '流行音樂微學程', '藝術整合微學程', '多媒體配樂微學程',
            '半導體製程產業人才培育學分學程', '華語文教學微學分學程', '科技產業管理微學分學程',
            '人工智慧探索應用學分學程', '人工智慧工業應用學分學程', '人工智慧自然語言技術學分學程', '人工智慧視覺技術學分學程',
            '客家語文專長', '新住民語文專長'
        ]
    };

    // 建立反向查找表
    const deptToCollege = {};
    Object.entries(collegeMap).forEach(([college, depts]) => {
        depts.forEach(dept => {
            deptToCollege[dept] = college;
        });
    });

    // 輔助判斷函數：如果不再列表中，嘗試使用關鍵字判斷 (作為備案)
    function getCollege(dept) {
        if (deptToCollege[dept]) return deptToCollege[dept];

        // 備案規則 (處理爬蟲可能抓到的新系所)
        if (/^(國文|英語|地理|歷史|經學|華語|客家|文學院)/.test(dept)) return '文學院';
        if (/^(數學|物理|化學|生物|科學|理學院)/.test(dept)) return '理學院';
        if (/^(教育|特殊|體育|成人|性別|諮商|運動)/.test(dept)) return '教育學院';
        if (/^(工業|電子|電機|軟體|工程|科技)/.test(dept)) return '科技學院';
        if (/^(美術|音樂|視覺|藝術)/.test(dept)) return '藝術學院';
        if (/^(事業|人力|管理)/.test(dept)) return '管理學院';
        if (/^(通識|軍訓)/.test(dept)) return '通識/體育/軍訓';
        if (/^(學程|專長)/.test(dept)) return '學程/專長';

        return '其他';
    }

    // 分組
    const grouped = {};
    const uncategorized = [];

    departments.forEach(dept => {
        const college = getCollege(dept);
        if (college === '其他') {
            uncategorized.push(dept);
        } else {
            if (!grouped[college]) grouped[college] = [];
            grouped[college].push(dept);
        }
    });

    // 填入分組後的選項
    const categoryOrder = ['文學院', '教育學院', '理學院', '科技學院', '藝術學院', '管理學院', '通識/體育/軍訓', '學程/專長'];

    categoryOrder.forEach(category => {
        if (grouped[category] && grouped[category].length > 0) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = category;
            grouped[category].forEach(dept => {
                const option = document.createElement('option');
                option.value = dept;
                option.textContent = dept;
                optgroup.appendChild(option);
            });
            select.appendChild(optgroup);
        }
    });

    // 未分類的系所
    if (uncategorized.length > 0) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = '其他';
        uncategorized.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            optgroup.appendChild(option);
        });
        select.appendChild(optgroup);
    }
}

function populateGradeSelect(degree = '') {
    const select = document.getElementById('grade-select');
    // 保存當前選擇
    const currentVal = select.value;

    // 清空選項
    select.innerHTML = '<option value="">-- 全部年級 --</option>';

    // 取得候選課程 (若有選學制則過濾)
    let candidates = allCourses;
    if (degree) {
        candidates = allCourses.filter(c => matchDegree(c.department, degree));
    }

    // 檢查有哪些年級存在
    // 判斷依據：offering_unit 中是否包含 "一"、"二" 等
    const grades = ['一', '二', '三', '四', '五', '六'];
    const foundGrades = new Set();

    candidates.forEach(c => {
        const unit = c.offering_unit || '';
        grades.forEach(g => {
            if (unit.includes(g)) foundGrades.add(g);
        });
    });

    // 根據找到的年級建立選項
    const labels = { '一': '一年級', '二': '二年級', '三': '三年級', '四': '四年級', '五': '五年級', '六': '六年級' };

    grades.forEach(g => {
        if (foundGrades.has(g)) {
            const option = document.createElement('option');
            option.value = g;
            option.textContent = labels[g] || g + '年級';
            select.appendChild(option);
        }
    });

    // 嘗試恢復選擇 (如果該選項還存在)
    if (foundGrades.has(currentVal)) {
        select.value = currentVal;
    }
}

// ========================================
// 事件綁定
// ========================================

function bindEvents() {
    document.getElementById('degree-select').addEventListener('change', (e) => {
        // 當學制改變時，重新填充系所選單和年級選單
        populateDepartmentSelect(e.target.value);
        populateGradeSelect(e.target.value);
        // 同時觸發篩選
        filterAndRenderCourses();
    });
    document.getElementById('department-select').addEventListener('change', filterAndRenderCourses);
    document.getElementById('grade-select').addEventListener('change', filterAndRenderCourses);
    document.getElementById('type-select').addEventListener('change', filterAndRenderCourses);
    document.getElementById('search-input').addEventListener('input', filterAndRenderCourses);
    document.getElementById('clear-btn').addEventListener('click', clearSchedule);
    // export-btn 已移除
    document.getElementById('select-all-btn').addEventListener('click', selectAllCourses);
    document.getElementById('deselect-all-btn').addEventListener('click', deselectAllCourses);

    // 新增匯出按鈕事件
    document.getElementById('export-csv-btn').addEventListener('click', exportScheduleToCSV);
    document.getElementById('export-img-btn').addEventListener('click', exportScheduleToImage);

    // 頁面載入時還原課表
    loadFromStorage();
}

// ========================================
// 資料持久化 (Persistence)
// ========================================

function saveToStorage() {
    localStorage.setItem('selectedCourses', JSON.stringify(selectedCourses));
}

function loadFromStorage() {
    const saved = localStorage.getItem('selectedCourses');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // 驗證資料有效性 (避免舊資料結構導致錯誤)
            if (Array.isArray(parsed)) {
                // 比對現有課程資料庫，確保課程代碼仍然有效
                // (雖然 allCourses 未必已載入，但這裡假設 loadFromStorage 在 fetch 後執行，或僅儲存代碼後來匹配)
                // 為了簡單起見，我們信任儲存的資料，但重新計算時會依賴 allCourses

                // 這裡有一個時序問題：allCourses 可能還沒載入完。
                // 我們應該在 init() 的 fetch 完成後呼叫 loadFromStorage
                selectedCourses = parsed;
                updateSchedule();
                // updateCourseListState(); // 移除：此函數不存在，且 renderCourseList 會處理初始狀態
            }
        } catch (e) {
            console.error('Failed to load schedule from storage', e);
            localStorage.removeItem('selectedCourses');
        }
    }
}

// ========================================
// 匯出功能 (Export)
// ========================================

function exportScheduleToCSV() {
    if (selectedCourses.length === 0) {
        alert('課表是空的，無法匯出');
        return;
    }

    // 1. 初始化 15 x 8 的矩陣 (Row: 節次, Col: 星期0~7, 0是大標題)
    // 假設最多 14 節 + 標題列
    // defined constants
    const days = ['', '週一', '週二', '週三', '週四', '週五', '週六', '週日'];
    const periods = [
        '第1節 (08:10-09:00)', '第2節 (09:10-10:00)', '第3節 (10:10-11:00)', '第4節 (11:10-12:00)',
        '第5節 (12:40-13:30)', '第6節 (13:40-14:30)', '第7節 (14:40-15:30)', '第8節 (15:40-16:30)',
        '第9節 (16:40-17:30)', '第10節 (17:35-18:25)', '第11節 (18:30-19:20)', '第12節 (19:25-20:15)',
        '第13節 (20:20-21:10)', '第14節 (21:15-22:05)'
    ];

    // 建立空的二維陣列 (14 rows x 8 cols)
    // grid[periodIndex][dayIndex]
    const grid = Array.from({ length: 14 }, () => Array(8).fill(''));

    // 填入第一欄的節次名稱
    grid.forEach((row, index) => {
        row[0] = periods[index];
    });

    // 2. 填入課程資料
    selectedCourses.forEach(course => {
        const timeStr = getClassTime(course); // ex: "13,14"
        const slots = parseClassTime(timeStr);

        slots.forEach(slot => {
            // slot.day: 1~7 (週一~週日)
            // slot.period: 1~14 or A,B,C... (需轉為 index)

            // 處理節次轉換 (這裡簡化處理，假設 period 是 "1"~"14" 的字串)
            // 這邊需要一個 helper 或簡單的 parseInt
            let pIndex = -1;
            // 嘗試解析數字
            const pNum = parseInt(slot.period);
            if (!isNaN(pNum) && pNum >= 1 && pNum <= 14) {
                pIndex = pNum - 1;
            } else {
                // 處理特殊節次如 A, B, C (早修/午休) 如有需要
                // 目前系統主要用數字 1-14
            }

            if (pIndex >= 0 && pIndex < 14 && slot.day >= 1 && slot.day <= 7) {
                const content = `${course.course_name_zh}\n(${course.instructor || '未定'}/${course.classroom || '未知'})`;

                // 如果該格已有內容 (極少見衝堂)，用分號串接
                if (grid[pIndex][slot.day]) {
                    grid[pIndex][slot.day] += `\n---\n${content}`;
                } else {
                    grid[pIndex][slot.day] = content;
                }
            }
        });
    });

    // 3. 組合 CSV
    // 加入標題列
    const csvRows = [days.join(',')];

    // 加入內容列
    grid.forEach(row => {
        // 對每個儲存格內容進行 CSV 轉義 (處理換行和逗號)
        const escapedRow = row.map(cell => {
            if (!cell) return '';
            // 將內容包在引號中，並將內部的引號重複一次 (CSV 標準)
            return `"${cell.replace(/"/g, '""')}"`;
        });
        csvRows.push(escapedRow.join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\n');

    // 下載
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'my_schedule_matrix.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportScheduleToImage() {
    const element = document.getElementById('schedule-capture');
    if (!element) return;

    // 使用 html2canvas 截圖
    html2canvas(element, {
        scale: 2, // 提高解析度
        backgroundColor: '#ffffff', // 確保背景白底
        useCORS: true // 允許跨域圖片 (雖然這裡沒用到)
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'my_schedule.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}


// ========================================
// 篩選與渲染課程
// ========================================

function filterAndRenderCourses() {
    const degree = document.getElementById('degree-select').value;
    const department = document.getElementById('department-select').value;
    const grade = document.getElementById('grade-select').value;
    const type = document.getElementById('type-select').value;
    const search = document.getElementById('search-input').value.toLowerCase().trim();

    // 如果有搜尋關鍵字，則全校搜尋
    if (search) {
        let filtered = allCourses.filter(c =>
            c.course_name_zh.toLowerCase().includes(search) ||
            c.course_name_en.toLowerCase().includes(search) ||
            c.instructor.toLowerCase().includes(search) ||
            c.course_code.toLowerCase().includes(search)
        );

        // 學制篩選
        if (degree) {
            filtered = filtered.filter(c => matchDegree(c.department, degree));
        }

        // 仍可套用類型篩選
        if (type) {
            filtered = filtered.filter(c => c.course_type.includes(type));
        }

        currentFilteredCourses = filtered;
        renderCourseList(filtered);
        document.getElementById('course-count').textContent = `${filtered.length} (全校搜尋)`;
        return;
    }

    // 無搜尋時需選擇系所
    if (!department) {
        document.getElementById('course-list').innerHTML =
            '<p class="placeholder-text">請選擇系所或輸入關鍵字搜尋全校課程</p>';
        document.getElementById('course-count').textContent = '0';
        currentFilteredCourses = [];
        return;
    }

    // 篩選課程
    let filtered = allCourses.filter(c => c.department === department);

    // 年級篩選（從 offering_unit 欄位判斷）
    if (grade) {
        filtered = filtered.filter(c => {
            const unit = c.offering_unit || '';
            return unit.includes(grade);
        });
    }

    // 類型篩選
    if (type) {
        filtered = filtered.filter(c => c.course_type.includes(type));
    }

    // 儲存當前篩選結果供全選功能使用
    currentFilteredCourses = filtered;

    renderCourseList(filtered);
    document.getElementById('course-count').textContent = filtered.length;
}

function renderCourseList(courses) {
    const container = document.getElementById('course-list');

    if (courses.length === 0) {
        container.innerHTML = '<p class="placeholder-text">沒有符合條件的課程</p>';
        return;
    }

    container.innerHTML = courses.map(course => {
        const isSelected = selectedCourses.some(c => c.course_code === course.course_code);
        const typeClass = course.course_type.includes('必修') ? 'course-type-required' : 'course-type-elective';

        return `
            <div class="course-card ${isSelected ? 'selected' : ''}" 
                 data-code="${course.course_code}"
                 onclick="toggleCourse('${course.course_code}')">
                <div class="course-checkbox"></div>
                <div class="course-info">
                    <div class="course-name">${course.course_name_zh}</div>
                    <div class="course-meta">
                        <span>${course.course_code}</span>
                        <span class="${typeClass}">${course.course_type}</span>
                        <span>${course.credits} 學分</span>
                        ${course.instructor ? `<span>${course.instructor}</span>` : ''}
                        ${getClassTime(course) ? `<span>時間: ${getClassTime(course)}</span>` : ''}
                        ${course.classroom ? `<span>教室: ${course.classroom.split(' - ')[0]}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ========================================
// 課程選擇
// ========================================

function toggleCourse(courseCode) {
    const course = allCourses.find(c => c.course_code === courseCode);
    if (!course) return;

    const index = selectedCourses.findIndex(c => c.course_code === courseCode);

    if (index >= 0) {
        // 取消選擇
        selectedCourses.splice(index, 1);
        courseColorMap.delete(courseCode);
    } else {
        // 檢查時間衝突
        const conflict = checkTimeConflict(course);
        if (conflict) {
            showConflictModal(course, conflict);
            return;
        }

        // 新增課程
        selectedCourses.push(course);
        courseColorMap.set(courseCode, colorIndex % 7);
        colorIndex++;
    }

    // 更新 UI
    updateCourseCardState(courseCode);
    renderSchedule();
    updateCredits();
    saveToStorage();
}

function updateCourseCardState(courseCode) {
    const card = document.querySelector(`.course-card[data-code="${courseCode}"]`);
    if (card) {
        const isSelected = selectedCourses.some(c => c.course_code === courseCode);
        card.classList.toggle('selected', isSelected);
    }
}

// ========================================
// 學制判斷
// ========================================

function matchDegree(department, degree) {
    const d = department || '';
    switch (degree) {
        case '大學部':
            return !d.includes('碩士') && !d.includes('博士') &&
                !d.includes('通識') && !d.includes('軍訓') &&
                (!d.includes('體育') || d.includes('體育學系')) && // 體育學系是大學部，體育(...)是通識
                !d.includes('學程') && !d.includes('專長') && !d.includes('學院課程');
        case '碩士班':
            return d.includes('碩士');
        case '博士班':
            return d.includes('博士');
        case '通識':
            return d.includes('通識') || (d.includes('體育') && !d.includes('體育學系')) || d.includes('軍訓');
        case '學院':
            return d.includes('學院課程');
        case '學程':
            return d.includes('教師教育學程') || d.includes('學程') || d.includes('專長');
        default:
            return true;
    }
}

// ========================================
// 時間解析與衝突檢測
// ========================================

function getClassTime(course) {
    // 時間格式應為數字和逗號組成，如 "13,14" 或 "46,47"
    // 檢查 class_time 是否為有效時間格式
    const timePattern = /^[\dTABC,]+$/;

    if (course.class_time && timePattern.test(course.class_time)) {
        return course.class_time;
    }
    if (course.enrollment && timePattern.test(course.enrollment)) {
        return course.enrollment;
    }
    return '';
}

function parseClassTime(timeStr) {
    // 時間格式如 "13,14" 表示週一第3節, 週一第4節
    // 或 "21,22,31,32" 表示週二第1,2節, 週三第1,2節
    if (!timeStr) return [];

    const slots = [];
    const parts = timeStr.split(',').map(s => s.trim());

    parts.forEach(part => {
        if (part.length >= 2) {
            const day = parseInt(part[0]);
            const period = part.slice(1);

            if (day >= 1 && day <= 7 && period) {
                slots.push({ day, period });
            }
        }
    });

    return slots;
}

function checkTimeConflict(newCourse) {
    const newSlots = parseClassTime(getClassTime(newCourse));

    for (const selected of selectedCourses) {
        const selectedSlots = parseClassTime(getClassTime(selected));

        for (const newSlot of newSlots) {
            for (const selSlot of selectedSlots) {
                if (newSlot.day === selSlot.day && newSlot.period === selSlot.period) {
                    return selected;
                }
            }
        }
    }

    return null;
}

// ========================================
// 課表渲染
// ========================================

function renderSchedule() {
    // 清空課表
    const cells = document.querySelectorAll('#schedule-body td[data-day]');
    cells.forEach(cell => cell.innerHTML = '');

    // 填入已選課程
    selectedCourses.forEach(course => {
        const slots = parseClassTime(getClassTime(course));
        const color = courseColorMap.get(course.course_code);

        slots.forEach(slot => {
            const cell = document.querySelector(
                `#schedule-body td[data-day="${slot.day}"][data-period="${slot.period}"]`
            );

            if (cell) {
                const div = document.createElement('div');
                div.className = 'schedule-cell';
                div.setAttribute('data-color', color);
                div.innerHTML = `
                    <div class="course-title">${course.course_name_zh}</div>
                    ${course.instructor ? `<div class="course-teacher">${course.instructor}</div>` : ''}
                    <div class="course-room">${course.classroom ? course.classroom.split(' - ')[0] : ''}</div>
                `;
                div.onclick = (e) => {
                    e.stopPropagation();
                    toggleCourse(course.course_code);
                    filterAndRenderCourses();
                };
                cell.appendChild(div);
            }
        });
    });
}

function updateCredits() {
    const totalCredits = selectedCourses.reduce((sum, c) => {
        const credits = parseFloat(c.credits) || 0;
        return sum + credits;
    }, 0);

    const creditsDisplay = document.getElementById('selected-credits');
    const MIN_CREDITS = 9;

    if (totalCredits > 0 && totalCredits < MIN_CREDITS) {
        creditsDisplay.textContent = `(${totalCredits} 學分 - 警告：低於最低 ${MIN_CREDITS} 學分)`;
        creditsDisplay.style.color = '#CD5C5C'; // 紅色警告
    } else {
        creditsDisplay.textContent = `(${totalCredits} 學分)`;
        creditsDisplay.style.color = ''; // 恢復預設
    }
}

// ========================================
// Modal
// ========================================

function showConflictModal(newCourse, conflictCourse) {
    const modal = document.getElementById('conflict-modal');
    const message = document.getElementById('conflict-message');

    message.textContent = `「${newCourse.course_name_zh}」與已選的「${conflictCourse.course_name_zh}」時間衝突！`;
    modal.classList.add('show');
}

function closeModal() {
    document.getElementById('conflict-modal').classList.remove('show');
}

// 點擊 modal 背景關閉
document.getElementById('conflict-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'conflict-modal') {
        closeModal();
    }
});

// ========================================
// 工具功能
// ========================================

function clearSchedule() {
    selectedCourses = [];
    courseColorMap.clear();
    colorIndex = 0;

    renderSchedule();
    updateCredits();
    filterAndRenderCourses();
    saveToStorage();
}

function exportSchedule() {
    // 簡單的匯出提示（實際匯出圖片需要 html2canvas 等套件）
    alert('提示：可使用瀏覽器的列印功能 (Ctrl+P) 將課表儲存為 PDF');
}

// 儲存當前篩選的課程列表
let currentFilteredCourses = [];

function selectAllCourses() {
    // 選擇當前篩選列表中所有課程（跳過有衝突的）
    let added = 0;
    let skipped = 0;

    currentFilteredCourses.forEach(course => {
        // 如果已選擇則跳過
        if (selectedCourses.some(c => c.course_code === course.course_code)) {
            return;
        }

        // 檢查時間衝突
        const conflict = checkTimeConflict(course);
        if (conflict) {
            skipped++;
            return;
        }

        // 新增課程
        selectedCourses.push(course);
        courseColorMap.set(course.course_code, colorIndex % 7);
        colorIndex++;
        added++;
    });

    renderSchedule();
    updateCredits();
    filterAndRenderCourses();
    saveToStorage();

    if (skipped > 0) {
        alert(`已選擇 ${added} 門課程，${skipped} 門因時間衝突而跳過`);
    }
}

function deselectAllCourses() {
    // 取消選擇當前篩選列表中的所有課程
    const filteredCodes = new Set(currentFilteredCourses.map(c => c.course_code));

    selectedCourses = selectedCourses.filter(c => !filteredCodes.has(c.course_code));

    // 清理顏色對應
    filteredCodes.forEach(code => courseColorMap.delete(code));

    renderSchedule();
    updateCredits();
    filterAndRenderCourses();
    saveToStorage();
}

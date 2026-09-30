const keywordInput = document.getElementById("keyword");
const clearBtn = document.getElementById("clearBtn");
const cardGrid = document.getElementById("cardGrid");
const resultCount = document.getElementById("resultCount");
const statusText = document.getElementById("statusText");
const emptyState = document.getElementById("emptyState");

let chapters = [];

function cleanMarkdown(text) {
  return String(text)
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function summarize(text, maxLength = 170) {
  const cleaned = cleanMarkdown(text);
  return cleaned.length > maxLength
    ? `${cleaned.slice(0, maxLength).trim()}…`
    : cleaned;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function highlight(text, keyword) {
  const safe = escapeHtml(text);
  if (!keyword) return safe;
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safe.replace(new RegExp(`(${escapedKeyword})`, "gi"), "<mark>$1</mark>");
}

function render(items, keyword = "") {
  cardGrid.innerHTML = items.map(item => {
    const title = highlight(item["제목"], keyword);
    const summary = highlight(summarize(item["본문"]), keyword);
    return `
      <article class="chapter-card">
        <span class="chapter-no">제${escapeHtml(item["장"])}장</span>
        <h3>${title}</h3>
        <p>${summary}</p>
      </article>
    `;
  }).join("");

  resultCount.textContent = `결과 ${items.length}건`;
  statusText.textContent = keyword
    ? `“${keyword}” 검색 결과`
    : "전체 장을 표시 중입니다.";
  emptyState.hidden = items.length !== 0;
}

function applyFilter() {
  const keyword = keywordInput.value.trim();
  const q = keyword.toLocaleLowerCase("ko-KR");

  const filtered = !q
    ? chapters
    : chapters.filter(item =>
        String(item["제목"]).toLocaleLowerCase("ko-KR").includes(q) ||
        String(item["본문"]).toLocaleLowerCase("ko-KR").includes(q)
      );

  render(filtered, keyword);
}

async function init() {
  try {
    const response = await fetch("./장데이터.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    chapters = await response.json();

    if (!Array.isArray(chapters)) {
      throw new Error("장데이터.json 형식이 배열이 아닙니다.");
    }

    render(chapters);
  } catch (error) {
    console.error(error);
    resultCount.textContent = "결과 0건";
    statusText.textContent = "장데이터.json을 불러오지 못했습니다.";
    cardGrid.innerHTML = `
      <div class="empty-state">
        정적 호스팅 환경에서 다시 확인해 주세요. 로컬에서는 file:// 대신 간단한 웹서버로 실행해야 합니다.
      </div>
    `;
  }
}

keywordInput.addEventListener("input", applyFilter);
clearBtn.addEventListener("click", () => {
  keywordInput.value = "";
  keywordInput.focus();
  applyFilter();
});

init();
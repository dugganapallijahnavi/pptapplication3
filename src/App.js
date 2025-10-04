import React, { useState } from "react";

// Helper function to render charts
function renderChart(chart, width = 320, height = 220) {
  if (!chart) return null;

  const { type, data } = chart;
  const maxValue = Math.max(...data);

  if (type === "pie") {
    const total = data.reduce((a, b) => a + b, 0);
    let cumulative = 0;
    const colors = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f"];

    return (
      <svg width={width} height={height} viewBox="0 0 200 200" style={{ margin: "auto", display: "block" }}>
        {data.map((d, i) => {
          const startAngle = (cumulative / total) * 2 * Math.PI;
          cumulative += d;
          const endAngle = (cumulative / total) * 2 * Math.PI;
          const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

          const x1 = 100 + 100 * Math.cos(startAngle);
          const y1 = 100 + 100 * Math.sin(startAngle);
          const x2 = 100 + 100 * Math.cos(endAngle);
          const y2 = 100 + 100 * Math.sin(endAngle);

          const pathData = `
            M100,100
            L${x1},${y1}
            A100,100 0 ${largeArcFlag} 1 ${x2},${y2}
            Z
          `;

          return <path key={i} d={pathData} fill={colors[i % colors.length]} />;
        })}
      </svg>
    );
  } else if (type === "bar") {
    const barWidth = width / data.length - 10;
    const colors = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f"];

    return (
      <svg width={width} height={height}>
        {data.map((d, i) => {
          const barHeight = (d / maxValue) * (height - 20);
          return (
            <rect
              key={i}
              x={i * (barWidth + 10) + 5}
              y={height - barHeight - 10}
              width={barWidth}
              height={barHeight}
              fill={colors[i % colors.length]}
            />
          );
        })}
      </svg>
    );
  } else if (type === "line") {
    const gap = width / (data.length - 1);
    const points = data
      .map((d, i) => `${i * gap},${height - (d / maxValue) * (height - 20) - 10}`)
      .join(" ");

    return (
      <svg width={width} height={height}>
        <polyline fill="none" stroke="#4e79a7" strokeWidth="3" points={points} />
        {data.map((d, i) => {
          const cx = i * gap;
          const cy = height - (d / maxValue) * (height - 20) - 10;
          return <circle key={i} cx={cx} cy={cy} r={4} fill="#f28e2b" />;
        })}
      </svg>
    );
  }

  return null;
}

export default function App() {
  const [slides, setSlides] = useState([
    {
      id: Date.now(),
      texts: [],
      chart: null,
    },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Text editing state
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  // Chart form state
  const [chartFormVisible, setChartFormVisible] = useState(false);
  const [chartTypeToAdd, setChartTypeToAdd] = useState(null);
  const [chartLabelsInput, setChartLabelsInput] = useState("");
  const [chartDataInput, setChartDataInput] = useState("");

  // Preview mode state
  const [previewMode, setPreviewMode] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const currentSlide = slides[currentIndex];

  // Add a new slide
  function addSlide() {
    const newSlide = { id: Date.now(), texts: [], chart: null };
    setSlides((prev) => [...prev, newSlide]);
    setCurrentIndex(slides.length);
    setSelectedTextId(null);
  }

  // Delete current slide
  function deleteSlide() {
    if (slides.length === 1) return;
    const newSlides = slides.filter((_, i) => i !== currentIndex);
    setSlides(newSlides);
    setCurrentIndex((i) => (i === 0 ? 0 : i - 1));
    setSelectedTextId(null);
  }

  // Select slide from sidebar
  function selectSlide(i) {
    setCurrentIndex(i);
    setSelectedTextId(null);
  }

  // Add text box
  function addText() {
    const newText = {
      id: Date.now(),
      text: "New Text",
      style: { bold: false, italic: false, underline: false, fontSize: 16 },
    };
    const newSlides = [...slides];
    newSlides[currentIndex].texts.push(newText);
    setSlides(newSlides);
    setSelectedTextId(newText.id);
    setEditingText(newText.text);
    setBold(false);
    setItalic(false);
    setUnderline(false);
    setFontSize(16);
  }

  // Select a text box for editing
  function selectText(id) {
    setSelectedTextId(id);
    const textObj = currentSlide.texts.find((t) => t.id === id);
    if (textObj) {
      setEditingText(textObj.text);
      setBold(textObj.style.bold);
      setItalic(textObj.style.italic);
      setUnderline(textObj.style.underline);
      setFontSize(textObj.style.fontSize);
    }
  }

  // Update text content
  function updateTextField(e) {
    setEditingText(e.target.value);
    const newSlides = [...slides];
    const textObj = newSlides[currentIndex].texts.find((t) => t.id === selectedTextId);
    if (textObj) {
      textObj.text = e.target.value;
      setSlides(newSlides);
    }
  }

  // Update text styles helpers
  function toggleBold() {
    setBold((b) => {
      const newBold = !b;
      updateTextStyle({ bold: newBold });
      return newBold;
    });
  }
  function toggleItalic() {
    setItalic((i) => {
      const newItalic = !i;
      updateTextStyle({ italic: newItalic });
      return newItalic;
    });
  }
  function toggleUnderline() {
    setUnderline((u) => {
      const newUnderline = !u;
      updateTextStyle({ underline: newUnderline });
      return newUnderline;
    });
  }
  function updateFontSize(e) {
    let size = parseInt(e.target.value);
    if (isNaN(size) || size < 8) size = 8;
    if (size > 72) size = 72;
    setFontSize(size);
    updateTextStyle({ fontSize: size });
  }

  function updateTextStyle(newStyle) {
    if (!selectedTextId) return;
    const newSlides = [...slides];
    const textObj = newSlides[currentIndex].texts.find((t) => t.id === selectedTextId);
    if (textObj) {
      textObj.style = { ...textObj.style, ...newStyle };
      setSlides(newSlides);
    }
  }

  // Chart form open
  function openChartForm(type) {
    setChartTypeToAdd(type);
    setChartLabelsInput("");
    setChartDataInput("");
    setChartFormVisible(true);
  }

  // Save chart data to current slide
  function saveChartData() {
    const labels = chartLabelsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const data = chartDataInput
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n >= 0);

    if (labels.length !== data.length || labels.length === 0) {
      alert("Labels and data must be non-empty and have the same length");
      return;
    }

    const newSlides = [...slides];
    newSlides[currentIndex].chart = { type: chartTypeToAdd, labels, data };
    setSlides(newSlides);
    setChartFormVisible(false);
  }

  // Remove chart from slide
  function removeChart() {
    const newSlides = [...slides];
    newSlides[currentIndex].chart = null;
    setSlides(newSlides);
  }

  // Render preview slide
  const renderPreviewSlide = (slide) => (
    <div
      style={{
        width: 800,
        height: 600,
        background: "white",
        boxShadow: "0 0 15px rgba(0,0,0,0.3)",
        padding: 24,
        borderRadius: 10,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div>
        {slide.texts.map((t) => (
          <div
            key={t.id}
            style={{
              fontWeight: t.style.bold ? "bold" : "normal",
              fontStyle: t.style.italic ? "italic" : "normal",
              textDecoration: t.style.underline ? "underline" : "none",
              fontSize: t.style.fontSize,
              marginBottom: 8,
              whiteSpace: "pre-wrap",
            }}
          >
            {t.text}
          </div>
        ))}
      </div>
      {slide.chart && (
        <div style={{ width: "100%", height: 350 }}>{renderChart(slide.chart, 780, 350)}</div>
      )}
    </div>
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          height: "100vh",
          background: "#f5f5f5",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: 180,
            background: "#fff",
            borderRight: "1px solid #ddd",
            overflowY: "auto",
            padding: 10,
          }}
        >
          <div style={{ marginBottom: 10, fontWeight: "bold" }}>Slides</div>
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              onClick={() => selectSlide(i)}
              style={{
                padding: 8,
                marginBottom: 8,
                cursor: "pointer",
                backgroundColor: i === currentIndex ? "#0078d7" : "#eee",
                color: i === currentIndex ? "white" : "black",
                borderRadius: 4,
              }}
            >
              <div>Slide {i + 1}</div>
              <div
                style={{
                  marginTop: 6,
                  background: "white",
                  border: "1px solid #ccc",
                  height: 120,
                  overflow: "hidden",
                  borderRadius: 4,
                  padding: 8,
                }}
              >
                {slide.texts.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      fontWeight: t.style.bold ? "bold" : "normal",
                      fontStyle: t.style.italic ? "italic" : "normal",
                      textDecoration: t.style.underline ? "underline" : "none",
                      fontSize: t.style.fontSize * 0.6,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {t.text}
                  </div>
                ))}
                {slide.chart && (
                  <div style={{ marginTop: 8 }}>
                    {renderChart(slide.chart, 150, 100)}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            "Remove chart from this slide?"
                          )
                        ) {
                          removeChart();
                        }
                      }}
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                    >
                      Remove Chart
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={addSlide}
            style={{
              width: "100%",
              padding: 8,
              marginTop: 8,
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            + Add Slide
          </button>
          <button
            onClick={deleteSlide}
            disabled={slides.length === 1}
            style={{
              width: "100%",
              padding: 8,
              marginTop: 8,
              background: slides.length === 1 ? "#ccc" : "#dc3545",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: slides.length === 1 ? "not-allowed" : "pointer",
            }}
          >
            Delete Slide
          </button>
        </div>

        {/* Main editor */}
        <div
          style={{
            flex: 1,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            background: "white",
            position: "relative",
          }}
        >
          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <button onClick={addText} style={{ marginRight: 8 }}>
                + Add Text
              </button>
              <button onClick={() => openChartForm("pie")} style={{ marginRight: 8 }}>
                Add Pie Chart
              </button>
              <button onClick={() => openChartForm("bar")} style={{ marginRight: 8 }}>
                Add Bar Chart
              </button>
              <button onClick={() => openChartForm("line")}>Add Line Chart</button>
            </div>

            <button
              onClick={() => {
                setPreviewMode(true);
                setPreviewIndex(currentIndex);
              }}
              style={{
                padding: "6px 12px",
                background: "#0078d7",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Preview Slides
            </button>
          </div>

          {/* Slide editing area */}
          <div
            style={{
              flex: 1,
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 20,
              position: "relative",
              background: "#fafafa",
              overflow: "auto",
            }}
          >
            {/* Render texts */}
            {currentSlide.texts.map((t) => (
              <div
                key={t.id}
                onClick={() => selectText(t.id)}
                style={{
                  padding: 6,
                  marginBottom: 10,
                  border:
                    t.id === selectedTextId
                      ? "2px solid #0078d7"
                      : "1px solid transparent",
                  cursor: "pointer",
                  fontWeight: t.style.bold ? "bold" : "normal",
                  fontStyle: t.style.italic ? "italic" : "normal",
                  textDecoration: t.style.underline ? "underline" : "none",
                  fontSize: t.style.fontSize,
                  backgroundColor: t.id === selectedTextId ? "white" : "transparent",
                  userSelect: "text",
                  whiteSpace: "pre-wrap",
                }}
              >
                {t.text}
              </div>
            ))}

            {/* Render chart */}
            {currentSlide.chart && (
              <div
                style={{
                  marginTop: 20,
                  border: "1px solid #ddd",
                  padding: 10,
                  background: "white",
                  maxWidth: "100%",
                  maxHeight: 300,
                  overflow: "hidden",
                }}
              >
                {renderChart(currentSlide.chart, 600, 300)}
                <button
                  onClick={() => {
                    if (window.confirm("Remove chart from this slide?")) {
                      removeChart();
                    }
                  }}
                  style={{
                    marginTop: 8,
                    padding: "4px 8px",
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  Remove Chart
                </button>
              </div>
            )}
          </div>

          {/* Text editing controls */}
          {selectedTextId && (
            <div
              style={{
                marginTop: 12,
                padding: 10,
                borderTop: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <textarea
                value={editingText}
                onChange={updateTextField}
                rows={3}
                style={{ flex: 1, fontSize: fontSize, resize: "vertical" }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button onClick={toggleBold} style={{ fontWeight: bold ? "bold" : "normal" }}>
                  B
                </button>
                <button onClick={toggleItalic} style={{ fontStyle: italic ? "italic" : "normal" }}>
                  I
                </button>
                <button
                  onClick={toggleUnderline}
                  style={{ textDecoration: underline ? "underline" : "none" }}
                >
                  U
                </button>
                <input
                  type="number"
                  value={fontSize}
                  min={8}
                  max={72}
                  onChange={updateFontSize}
                  style={{ width: 50 }}
                  title="Font Size"
                />
              </div>
            </div>
          )}

          {/* Chart input form */}
          {chartFormVisible && (
            <div
              style={{
                position: "fixed",
                top: "20%",
                left: "50%",
                transform: "translateX(-50%)",
                background: "white",
                border: "1px solid #ccc",
                padding: 20,
                boxShadow: "0 0 15px rgba(0,0,0,0.3)",
                zIndex: 1000,
                width: 320,
                borderRadius: 8,
              }}
            >
              <h3>Add {chartTypeToAdd.charAt(0).toUpperCase() + chartTypeToAdd.slice(1)} Chart</h3>
              <label style={{ display: "block", marginBottom: 10 }}>
                Labels (comma separated):
                <input
                  type="text"
                  value={chartLabelsInput}
                  onChange={(e) => setChartLabelsInput(e.target.value)}
                  style={{ width: "100%", marginTop: 4 }}
                  placeholder="e.g. A, B, C"
                />
              </label>
              <label style={{ display: "block", marginBottom: 10 }}>
                Data (comma separated numbers):
                <input
                  type="text"
                  value={chartDataInput}
                  onChange={(e) => setChartDataInput(e.target.value)}
                  style={{ width: "100%", marginTop: 4 }}
                  placeholder="e.g. 10, 20, 30"
                />
              </label>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={saveChartData} style={{ flex: 1 }}>
                  Save
                </button>
                <button onClick={() => setChartFormVisible(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview modal */}
      {previewMode && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            flexDirection: "column",
            padding: 20,
          }}
        >
          <button
            onClick={() => setPreviewMode(false)}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              background: "#d9534f",
              border: "none",
              color: "white",
              fontSize: 18,
              padding: "10px 16px",
              borderRadius: 6,
              cursor: "pointer",
              zIndex: 2100,
            }}
          >
            Close
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <button
              onClick={() =>
                setPreviewIndex((i) => (i === 0 ? slides.length - 1 : i - 1))
              }
              style={{
                fontSize: 28,
                padding: "10px 16px",
                cursor: "pointer",
                background: "#0078d7",
                color: "white",
                border: "none",
                borderRadius: 6,
                userSelect: "none",
              }}
            >
              ◀
            </button>

            {renderPreviewSlide(slides[previewIndex])}

            <button
              onClick={() =>
                setPreviewIndex((i) => (i === slides.length - 1 ? 0 : i + 1))
              }
              style={{
                fontSize: 28,
                padding: "10px 16px",
                cursor: "pointer",
                background: "#0078d7",
                color: "white",
                border: "none",
                borderRadius: 6,
                userSelect: "none",
              }}
            >
              ▶
            </button>
          </div>

          <div style={{ color: "white", marginTop: 12, fontSize: 18 }}>
            Slide {previewIndex + 1} / {slides.length}
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState } from "react";
import "./App.css";

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
      texts: [
        {
          id: Date.now() + 1,
          text: "New Text",
          style: { bold: false, italic: false, underline: false, fontSize: 16, color: "#000000" },
        },
      ],
      chart: null,
      backgroundColor: "#ffffff",
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
  const [textColor, setTextColor] = useState("#000000");

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
    const newText = {
      id: Date.now(),
      text: "New Text",
      style: { bold: false, italic: false, underline: false, fontSize: 16, color: "#000000" },
    };
    const newSlide = { id: Date.now(), texts: [newText], chart: null, backgroundColor: "#ffffff" };
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
      style: { bold: false, italic: false, underline: false, fontSize: 16, color: "#000000" },
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
    setTextColor("#000000");
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
      setTextColor(textObj.style.color || "#000000");
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
  function updateTextColor(e) {
    const color = e.target.value;
    setTextColor(color);
    updateTextStyle({ color: color });
  }
  function updateBackgroundColor(e) {
    const color = e.target.value;
    const newSlides = [...slides];
    if (!newSlides[currentIndex].backgroundColor) {
      newSlides[currentIndex] = { ...newSlides[currentIndex], backgroundColor: color };
    } else {
      newSlides[currentIndex].backgroundColor = color;
    }
    setSlides(newSlides);
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
  function removeChart(slideIndex = currentIndex) {
    const newSlides = [...slides];
    newSlides[slideIndex].chart = null;
    setSlides(newSlides);
  }

  // Render preview slide
  const renderPreviewSlide = (slide) => (
    <div
      style={{
        width: 800,
        height: 600,
        background: slide.backgroundColor || "white",
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
              color: t.style.color || "#000000",
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
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: 220,
            background: "#2d3748",
            borderRight: "none",
            overflowY: "auto",
            padding: 16,
            boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ marginBottom: 16, fontWeight: "bold", fontSize: 18, color: "#fff", letterSpacing: "0.5px" }}>📊 Slides</div>
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              onClick={() => selectSlide(i)}
              style={{
                padding: 10,
                marginBottom: 12,
                cursor: "pointer",
                backgroundColor: i === currentIndex ? "#667eea" : "#4a5568",
                color: "white",
                borderRadius: 8,
                transition: "all 0.3s ease",
                boxShadow: i === currentIndex ? "0 4px 12px rgba(102, 126, 234, 0.4)" : "0 2px 4px rgba(0,0,0,0.2)",
                transform: i === currentIndex ? "scale(1.02)" : "scale(1)",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Slide {i + 1}</div>
              <div
                style={{
                  marginTop: 6,
                  background: slide.backgroundColor || "white",
                  border: "2px solid rgba(255,255,255,0.1)",
                  height: 120,
                  overflow: "hidden",
                  borderRadius: 6,
                  padding: 8,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
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
                        fontSize: t.style.fontSize * 0.6,
                        color: t.style.color || "#000000",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {t.text}
                    </div>
                  ))}
                </div>
                {slide.chart && (
                  <div style={{ marginTop: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {renderChart(slide.chart, 150, 80)}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Remove chart from this slide?")) removeChart(i);
                      }}
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        padding: "4px 8px",
                        cursor: "pointer",
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
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
            className="add-slide-btn"
            style={{
              width: "100%",
              padding: 12,
              marginTop: 12,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              transition: "all 0.3s ease",
            }}
          >
            ✨ Add Slide
          </button>
          <button
            onClick={deleteSlide}
            disabled={slides.length === 1}
            style={{
              width: "100%",
              padding: 12,
              marginTop: 8,
              background: slides.length === 1 ? "#4a5568" : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: slides.length === 1 ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: 14,
              opacity: slides.length === 1 ? 0.5 : 1,
              boxShadow: slides.length === 1 ? "none" : "0 4px 8px rgba(0,0,0,0.2)",
              transition: "all 0.3s ease",
            }}
          >
            🗑️ Delete Slide
          </button>
        </div>

        {/* Main editor */}
        <div
          style={{
            flex: 1,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            background: "#f7fafc",
            position: "relative",
          }}
        >
          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={addText} style={{
                padding: "10px 16px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                transition: "all 0.3s ease",
              }}>
                📝 Add Text
              </button>
              <button onClick={() => openChartForm("pie")} style={{
                padding: "10px 16px",
                background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                boxShadow: "0 2px 8px rgba(250, 112, 154, 0.3)",
                transition: "all 0.3s ease",
              }}>
                🥧 Pie Chart
              </button>
              <button onClick={() => openChartForm("bar")} style={{
                padding: "10px 16px",
                background: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                boxShadow: "0 2px 8px rgba(48, 207, 208, 0.3)",
                transition: "all 0.3s ease",
              }}>
                📊 Bar Chart
              </button>
              <button onClick={() => openChartForm("line")} style={{
                padding: "10px 16px",
                background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                color: "#333",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                boxShadow: "0 2px 8px rgba(168, 237, 234, 0.3)",
                transition: "all 0.3s ease",
              }}>📈 Line Chart</button>
              <label style={{ marginLeft: 8, display: "inline-flex", alignItems: "center", gap: 8, background: "white", padding: "8px 12px", borderRadius: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.1)", fontWeight: 600, fontSize: 13 }}>
                🎨 Background:
                <input
                  type="color"
                  value={currentSlide.backgroundColor || "#ffffff"}
                  onChange={updateBackgroundColor}
                  style={{ cursor: "pointer", height: 32, width: 50, border: "2px solid #e2e8f0", borderRadius: 6 }}
                  title="Slide Background Color"
                />
              </label>
            </div>

            <button
              onClick={() => {
                setPreviewMode(true);
                setPreviewIndex(currentIndex);
              }}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                transition: "all 0.3s ease",
              }}
            >
              👁️ Preview Slides
            </button>
          </div>

          {/* Slide editing area */}
          <div
            style={{
              flex: 1,
              border: "none",
              borderRadius: 12,
              padding: 32,
              position: "relative",
              background: currentSlide.backgroundColor || "#ffffff",
              overflow: "auto",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}
          >
            {/* Render texts */}
            {currentSlide.texts.map((t) => (
              <div
                key={t.id}
                onClick={() => selectText(t.id)}
                style={{
                  padding: 12,
                  marginBottom: 12,
                  border:
                    t.id === selectedTextId
                      ? "3px solid #667eea"
                      : "2px solid transparent",
                  cursor: "pointer",
                  fontWeight: t.style.bold ? "bold" : "normal",
                  fontStyle: t.style.italic ? "italic" : "normal",
                  textDecoration: t.style.underline ? "underline" : "none",
                  fontSize: t.style.fontSize,
                  color: t.style.color || "#000000",
                  backgroundColor: t.id === selectedTextId ? "rgba(102, 126, 234, 0.05)" : "transparent",
                  userSelect: "text",
                  whiteSpace: "pre-wrap",
                  borderRadius: 8,
                  transition: "all 0.2s ease",
                  boxShadow: t.id === selectedTextId ? "0 4px 12px rgba(102, 126, 234, 0.15)" : "none",
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
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
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
                marginTop: 16,
                padding: 16,
                borderTop: "2px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "white",
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <textarea
                value={editingText}
                onChange={updateTextField}
                rows={3}
                className="styled-textarea"
                style={{ 
                  flex: 1, 
                  fontSize: fontSize, 
                  resize: "vertical",
                  padding: 12,
                  border: "2px solid #e2e8f0",
                  borderRadius: 8,
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border 0.2s ease",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={toggleBold} style={{ 
                  padding: "8px 12px",
                  background: bold ? "#667eea" : "#e2e8f0",
                  color: bold ? "white" : "#333",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                  transition: "all 0.2s ease",
                }}>
                  B
                </button>
                <button onClick={toggleItalic} style={{ 
                  fontStyle: italic ? "italic" : "normal",
                  padding: "8px 12px",
                  background: italic ? "#667eea" : "#e2e8f0",
                  color: italic ? "white" : "#333",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                  transition: "all 0.2s ease",
                }}>
                  I
                </button>
                <button
                  onClick={toggleUnderline}
                  style={{ 
                    textDecoration: underline ? "underline" : "none",
                    padding: "8px 12px",
                    background: underline ? "#667eea" : "#e2e8f0",
                    color: underline ? "white" : "#333",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 700,
                    transition: "all 0.2s ease",
                  }}
                >
                  U
                </button>
                <input
                  type="number"
                  value={fontSize}
                  min={8}
                  max={72}
                  onChange={updateFontSize}
                  style={{ 
                    width: 60,
                    padding: 8,
                    border: "2px solid #e2e8f0",
                    borderRadius: 6,
                    textAlign: "center",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                  title="Font Size"
                />
                <input
                  type="color"
                  value={textColor}
                  onChange={updateTextColor}
                  style={{ 
                    width: 60, 
                    height: 36, 
                    cursor: "pointer",
                    border: "2px solid #e2e8f0",
                    borderRadius: 6,
                  }}
                  title="Text Color"
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
                border: "none",
                padding: 28,
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                zIndex: 1000,
                width: 380,
                borderRadius: 16,
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 20, color: "#2d3748", fontSize: 20, fontWeight: 700 }}>Add {chartTypeToAdd.charAt(0).toUpperCase() + chartTypeToAdd.slice(1)} Chart</h3>
              <label style={{ display: "block", marginBottom: 16, fontSize: 14, fontWeight: 600, color: "#4a5568" }}>
                Labels (comma separated):
                <input
                  type="text"
                  value={chartLabelsInput}
                  onChange={(e) => setChartLabelsInput(e.target.value)}
                  className="styled-input"
                  style={{ width: "100%", marginTop: 8, padding: 12, border: "2px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", transition: "border 0.2s ease" }}
                  placeholder="e.g. A, B, C"
                />
              </label>
              <label style={{ display: "block", marginBottom: 20, fontSize: 14, fontWeight: 600, color: "#4a5568" }}>
                Data (comma separated numbers):
                <input
                  type="text"
                  value={chartDataInput}
                  onChange={(e) => setChartDataInput(e.target.value)}
                  className="styled-input"
                  style={{ width: "100%", marginTop: 8, padding: 12, border: "2px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", transition: "border 0.2s ease" }}
                  placeholder="e.g. 10, 20, 30"
                />
              </label>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button onClick={saveChartData} style={{ flex: 1, padding: "12px 20px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14, boxShadow: "0 4px 8px rgba(102, 126, 234, 0.3)", transition: "all 0.3s ease" }}>
                  ✔️ Save
                </button>
                <button onClick={() => setChartFormVisible(false)} style={{ flex: 1, padding: "12px 20px", background: "#e2e8f0", color: "#4a5568", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14, transition: "all 0.3s ease" }}>
                  ❌ Cancel
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
            backgroundColor: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            flexDirection: "column",
            padding: 20,
            backdropFilter: "blur(8px)",
          }}
        >
          <button
            onClick={() => setPreviewMode(false)}
            style={{
              position: "absolute",
              top: 30,
              right: 30,
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              border: "none",
              color: "white",
              fontSize: 16,
              fontWeight: 600,
              padding: "12px 24px",
              borderRadius: 10,
              cursor: "pointer",
              zIndex: 2100,
              boxShadow: "0 4px 12px rgba(245, 87, 108, 0.4)",
              transition: "all 0.3s ease",
            }}
          >
            ✖️ Close
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <button
              onClick={() =>
                setPreviewIndex((i) => (i === 0 ? slides.length - 1 : i - 1))
              }
              style={{
                fontSize: 32,
                padding: "16px 20px",
                cursor: "pointer",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: 12,
                userSelect: "none",
                boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
                transition: "all 0.3s ease",
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
                fontSize: 32,
                padding: "16px 20px",
                cursor: "pointer",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: 12,
                userSelect: "none",
                boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
                transition: "all 0.3s ease",
              }}
            >
              ▶
            </button>
          </div>

          <div style={{ color: "white", marginTop: 20, fontSize: 20, fontWeight: 600, background: "rgba(255,255,255,0.1)", padding: "10px 24px", borderRadius: 10, backdropFilter: "blur(10px)" }}>
            Slide {previewIndex + 1} / {slides.length}
          </div>
        </div>
      )}
    </>
  );
}

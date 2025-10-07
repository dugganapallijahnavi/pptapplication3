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

// Predefined slide layouts
const LAYOUTS = {
  blank: {
    name: "Blank",
    icon: "📄",
    texts: [
      {
        text: "Click to edit",
        style: { bold: false, italic: false, underline: false, fontSize: 16, color: "#000000" },
      },
    ],
  },
  title: {
    name: "Title Slide",
    icon: "📋",
    texts: [
      {
        text: "Presentation Title",
        style: { bold: true, italic: false, underline: false, fontSize: 48, color: "#2d3748" },
      },
      {
        text: "Subtitle or Author Name",
        style: { bold: false, italic: true, underline: false, fontSize: 24, color: "#4a5568" },
      },
    ],
  },
  titleContent: {
    name: "Title & Content",
    icon: "📝",
    texts: [
      {
        text: "Slide Title",
        style: { bold: true, italic: false, underline: false, fontSize: 36, color: "#2d3748" },
      },
      {
        text: "• Bullet point 1\n• Bullet point 2\n• Bullet point 3",
        style: { bold: false, italic: false, underline: false, fontSize: 18, color: "#000000" },
      },
    ],
  },
  twoColumn: {
    name: "Two Column",
    icon: "📊",
    texts: [
      {
        text: "Slide Title",
        style: { bold: true, italic: false, underline: false, fontSize: 36, color: "#2d3748" },
      },
      {
        text: "Left Column Content\n• Point 1\n• Point 2",
        style: { bold: false, italic: false, underline: false, fontSize: 18, color: "#000000" },
      },
      {
        text: "Right Column Content\n• Point 1\n• Point 2",
        style: { bold: false, italic: false, underline: false, fontSize: 18, color: "#000000" },
      },
    ],
  },
  comparison: {
    name: "Comparison",
    icon: "⚖️",
    texts: [
      {
        text: "Comparison Title",
        style: { bold: true, italic: false, underline: false, fontSize: 36, color: "#2d3748" },
      },
      {
        text: "Option A",
        style: { bold: true, italic: false, underline: false, fontSize: 24, color: "#667eea" },
      },
      {
        text: "Details about option A",
        style: { bold: false, italic: false, underline: false, fontSize: 16, color: "#000000" },
      },
      {
        text: "Option B",
        style: { bold: true, italic: false, underline: false, fontSize: 24, color: "#764ba2" },
      },
      {
        text: "Details about option B",
        style: { bold: false, italic: false, underline: false, fontSize: 16, color: "#000000" },
      },
    ],
  },
  section: {
    name: "Section Header",
    icon: "🎯",
    texts: [
      {
        text: "Section Title",
        style: { bold: true, italic: false, underline: false, fontSize: 56, color: "#ffffff" },
      },
    ],
    backgroundColor: "#667eea",
  },
};

export default function App() {
  const [slides, setSlides] = useState([
    {
      id: Date.now(),
      texts: [
        {
          id: Date.now() + 1,
          text: "New Text",
          style: { bold: false, italic: false, underline: false, fontSize: 16, color: "#000000" },
          position: { x: 50, y: 50 },
          size: { width: 300, height: 100 },
        },
      ],
      images: [],
      shapes: [],
      chart: null,
      backgroundColor: "#ffffff",
      layout: "blank",
    },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Text editing state
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [hoveredShapeId, setHoveredShapeId] = useState(null);
  const [hoveredChart, setHoveredChart] = useState(false);
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

  // Layout selection state
  const [layoutPickerVisible, setLayoutPickerVisible] = useState(false);

  // Insert menu state
  const [insertMenuVisible, setInsertMenuVisible] = useState(false);

  // Files menu state
  const [filesMenuVisible, setFilesMenuVisible] = useState(false);

  const currentSlide = slides[currentIndex];

  // Add a new slide with layout
  function addSlide(layoutKey = "blank") {
    const layout = LAYOUTS[layoutKey];
    const newTexts = layout.texts.map((t, idx) => ({
      id: Date.now() + idx,
      text: t.text,
      style: { ...t.style },
      position: { x: 50, y: 50 + idx * 120 },
      size: { width: 400, height: 100 },
    }));
    const newSlide = {
      id: Date.now(),
      texts: newTexts,
      images: [],
      shapes: [],
      chart: null,
      backgroundColor: layout.backgroundColor || "#ffffff",
      layout: layoutKey,
    };
    setSlides((prev) => [...prev, newSlide]);
    setCurrentIndex(slides.length);
    setSelectedTextId(null);
  }

  // Apply layout to current slide
  function applyLayout(layoutKey) {
    const layout = LAYOUTS[layoutKey];
    const newTexts = layout.texts.map((t, idx) => ({
      id: Date.now() + idx,
      text: t.text,
      style: { ...t.style },
      position: { x: 50, y: 50 + idx * 120 },
      size: { width: 400, height: 100 },
    }));
    const newSlides = [...slides];
    newSlides[currentIndex] = {
      ...newSlides[currentIndex],
      texts: newTexts,
      backgroundColor: layout.backgroundColor || newSlides[currentIndex].backgroundColor,
      layout: layoutKey,
    };
    setSlides(newSlides);
    setSelectedTextId(null);
    setLayoutPickerVisible(false);
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
      position: { x: 50, y: 50 },
      size: { width: 300, height: 100 },
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

  // Delete a text box
  function deleteText(textId) {
    const newSlides = [...slides];
    newSlides[currentIndex].texts = newSlides[currentIndex].texts.filter(t => t.id !== textId);
    setSlides(newSlides);
    if (selectedTextId === textId) {
      setSelectedTextId(null);
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
    newSlides[currentIndex].chart = { 
      type: chartTypeToAdd, 
      labels, 
      data,
      position: { x: 150, y: 150 },
      size: { width: 400, height: 300 },
    };
    setSlides(newSlides);
    setChartFormVisible(false);
  }

  // Remove chart from slide
  function removeChart(slideIndex = currentIndex) {
    const newSlides = [...slides];
    newSlides[slideIndex].chart = null;
    setSlides(newSlides);
  }

  // Add image to current slide
  function addImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const newImage = {
        id: Date.now(),
        src: event.target.result,
        width: 300,
        height: 200,
      };
      const newSlides = [...slides];
      if (!newSlides[currentIndex].images) {
        newSlides[currentIndex].images = [];
      }
      newSlides[currentIndex].images.push(newImage);
      setSlides(newSlides);
    };
    reader.readAsDataURL(file);
  }

  // Remove image from slide
  function removeImage(imageId) {
    const newSlides = [...slides];
    newSlides[currentIndex].images = newSlides[currentIndex].images.filter(img => img.id !== imageId);
    setSlides(newSlides);
  }

  // Add shape to current slide
  function addShape(shapeType) {
    const newShape = {
      id: Date.now(),
      type: shapeType,
      width: 150,
      height: 100,
      color: "#667eea",
      borderColor: "#4e5ba6",
      borderWidth: 2,
      position: { x: 100, y: 100 },
    };
    const newSlides = [...slides];
    if (!newSlides[currentIndex].shapes) {
      newSlides[currentIndex].shapes = [];
    }
    newSlides[currentIndex].shapes.push(newShape);
    setSlides(newSlides);
    setInsertMenuVisible(false);
  }

  // Remove shape from slide
  function removeShape(shapeId) {
    const newSlides = [...slides];
    newSlides[currentIndex].shapes = newSlides[currentIndex].shapes.filter(shape => shape.id !== shapeId);
    setSlides(newSlides);
  }

  // Drag handlers for text
  function handleTextDragStart(e, textId) {
    const textObj = currentSlide.texts.find(t => t.id === textId);
    if (!textObj || !textObj.position) return;
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'text',
      id: textId,
      offsetX: e.clientX - textObj.position.x,
      offsetY: e.clientY - textObj.position.y,
    }));
  }

  // Drag handlers for shape
  function handleShapeDragStart(e, shapeId) {
    const shape = currentSlide.shapes.find(s => s.id === shapeId);
    if (!shape || !shape.position) return;
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'shape',
      id: shapeId,
      offsetX: e.clientX - shape.position.x,
      offsetY: e.clientY - shape.position.y,
    }));
  }

  // Drag handlers for chart
  function handleChartDragStart(e) {
    if (!currentSlide.chart || !currentSlide.chart.position) return;
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'chart',
      offsetX: e.clientX - currentSlide.chart.position.x,
      offsetY: e.clientY - currentSlide.chart.position.y,
    }));
  }

  // Handle drop on slide
  function handleSlideDrop(e) {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const newSlides = [...slides];
    const slideRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - slideRect.left - data.offsetX;
    const y = e.clientY - slideRect.top - data.offsetY;

    if (data.type === 'text') {
      const textObj = newSlides[currentIndex].texts.find(t => t.id === data.id);
      if (textObj) {
        textObj.position = { x: Math.max(0, x), y: Math.max(0, y) };
      }
    } else if (data.type === 'shape') {
      const shape = newSlides[currentIndex].shapes.find(s => s.id === data.id);
      if (shape) {
        shape.position = { x: Math.max(0, x), y: Math.max(0, y) };
      }
    } else if (data.type === 'chart') {
      if (newSlides[currentIndex].chart) {
        newSlides[currentIndex].chart.position = { x: Math.max(0, x), y: Math.max(0, y) };
      }
    }

    setSlides(newSlides);
  }

  function handleSlideDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  // Resize handlers
  function handleTextResize(textId, newWidth, newHeight) {
    const newSlides = [...slides];
    const textObj = newSlides[currentIndex].texts.find(t => t.id === textId);
    if (textObj) {
      textObj.size = { width: Math.max(100, newWidth), height: Math.max(50, newHeight) };
      setSlides(newSlides);
    }
  }

  function handleShapeResize(shapeId, newWidth, newHeight) {
    const newSlides = [...slides];
    const shape = newSlides[currentIndex].shapes.find(s => s.id === shapeId);
    if (shape) {
      shape.width = Math.max(50, newWidth);
      shape.height = Math.max(50, newHeight);
      setSlides(newSlides);
    }
  }

  function handleChartResize(newWidth, newHeight) {
    const newSlides = [...slides];
    if (newSlides[currentIndex].chart) {
      newSlides[currentIndex].chart.size = { 
        width: Math.max(200, newWidth), 
        height: Math.max(150, newHeight) 
      };
      setSlides(newSlides);
    }
  }

  // Render shape
  function renderShape(shape) {
    const { type, width, height, color, borderColor, borderWidth } = shape;
    
    if (type === 'rectangle') {
      return (
        <div style={{
          width,
          height,
          backgroundColor: color,
          border: `${borderWidth}px solid ${borderColor}`,
          borderRadius: 4,
        }} />
      );
    } else if (type === 'circle') {
      return (
        <div style={{
          width,
          height,
          backgroundColor: color,
          border: `${borderWidth}px solid ${borderColor}`,
          borderRadius: '50%',
        }} />
      );
    } else if (type === 'triangle') {
      return (
        <div style={{
          width: 0,
          height: 0,
          borderLeft: `${width / 2}px solid transparent`,
          borderRight: `${width / 2}px solid transparent`,
          borderBottom: `${height}px solid ${color}`,
        }} />
      );
    } else if (type === 'arrow') {
      return (
        <svg width={width} height={height} viewBox="0 0 100 50">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill={color} />
            </marker>
          </defs>
          <line x1="0" y1="25" x2="90" y2="25" stroke={color} strokeWidth="4" markerEnd="url(#arrowhead)" />
        </svg>
      );
    } else if (type === 'star') {
      return (
        <svg width={width} height={height} viewBox="0 0 100 100">
          <polygon
            points="50,10 61,40 95,40 68,60 79,90 50,70 21,90 32,60 5,40 39,40"
            fill={color}
            stroke={borderColor}
            strokeWidth={borderWidth}
          />
        </svg>
      );
    }
    return null;
  }

  // Export to JSON
  function exportToJSON() {
    const dataStr = JSON.stringify(slides, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'presentation.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  // Import from JSON
  function importFromJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedSlides = JSON.parse(event.target.result);
        setSlides(importedSlides);
        setCurrentIndex(0);
        setSelectedTextId(null);
        alert('Presentation imported successfully!');
      } catch (error) {
        alert('Error importing file. Please ensure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
  }

  // Export to HTML
  function exportToHTML() {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presentation</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .slide-container {
      width: 800px;
      height: 600px;
      background: white;
      box-shadow: 0 0 30px rgba(255,255,255,0.3);
      padding: 24px;
      border-radius: 10px;
      overflow: auto;
      position: relative;
    }
    .controls {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 20px;
      align-items: center;
      background: rgba(255,255,255,0.1);
      padding: 15px 30px;
      border-radius: 50px;
      backdrop-filter: blur(10px);
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 18px;
      font-weight: 600;
    }
    button:hover {
      opacity: 0.9;
    }
    .counter {
      color: white;
      font-size: 18px;
      font-weight: 600;
    }
    .slide-image {
      margin: 10px 0;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div id="slide" class="slide-container"></div>
  <div class="controls">
    <button onclick="prevSlide()">◀ Previous</button>
    <span class="counter" id="counter"></span>
    <button onclick="nextSlide()">Next ▶</button>
  </div>
  
  <script>
    const slides = ${JSON.stringify(slides)};
    let currentSlide = 0;
    
    function renderChart(chart, width, height) {
      if (!chart) return '';
      const { type, data } = chart;
      const maxValue = Math.max(...data);
      
      if (type === 'pie') {
        const total = data.reduce((a, b) => a + b, 0);
        let cumulative = 0;
        const colors = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f'];
        let paths = '';
        
        data.forEach((d, i) => {
          const startAngle = (cumulative / total) * 2 * Math.PI;
          cumulative += d;
          const endAngle = (cumulative / total) * 2 * Math.PI;
          const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
          const x1 = 100 + 100 * Math.cos(startAngle);
          const y1 = 100 + 100 * Math.sin(startAngle);
          const x2 = 100 + 100 * Math.cos(endAngle);
          const y2 = 100 + 100 * Math.sin(endAngle);
          paths += \`<path d="M100,100 L\${x1},\${y1} A100,100 0 \${largeArcFlag} 1 \${x2},\${y2} Z" fill="\${colors[i % colors.length]}" />\`;
        });
        
        return \`<svg width="\${width}" height="\${height}" viewBox="0 0 200 200" style="margin: auto; display: block;">\${paths}</svg>\`;
      } else if (type === 'bar') {
        const barWidth = width / data.length - 10;
        const colors = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f'];
        let rects = '';
        
        data.forEach((d, i) => {
          const barHeight = (d / maxValue) * (height - 20);
          rects += \`<rect x="\${i * (barWidth + 10) + 5}" y="\${height - barHeight - 10}" width="\${barWidth}" height="\${barHeight}" fill="\${colors[i % colors.length]}" />\`;
        });
        
        return \`<svg width="\${width}" height="\${height}">\${rects}</svg>\`;
      } else if (type === 'line') {
        const gap = width / (data.length - 1);
        const points = data.map((d, i) => \`\${i * gap},\${height - (d / maxValue) * (height - 20) - 10}\`).join(' ');
        let circles = '';
        
        data.forEach((d, i) => {
          const cx = i * gap;
          const cy = height - (d / maxValue) * (height - 20) - 10;
          circles += \`<circle cx="\${cx}" cy="\${cy}" r="4" fill="#f28e2b" />\`;
        });
        
        return \`<svg width="\${width}" height="\${height}"><polyline fill="none" stroke="#4e79a7" stroke-width="3" points="\${points}" />\${circles}</svg>\`;
      }
      return '';
    }
    
    function showSlide(index) {
      const slide = slides[index];
      const slideEl = document.getElementById('slide');
      slideEl.style.background = slide.backgroundColor || 'white';
      
      let content = '';
      slide.texts.forEach(t => {
        content += \`<div style="
          font-weight: \${t.style.bold ? 'bold' : 'normal'};
          font-style: \${t.style.italic ? 'italic' : 'normal'};
          text-decoration: \${t.style.underline ? 'underline' : 'none'};
          font-size: \${t.style.fontSize}px;
          color: \${t.style.color || '#000000'};
          margin-bottom: 8px;
          white-space: pre-wrap;
        ">\${t.text}</div>\`;
      });
      
      if (slide.images && slide.images.length > 0) {
        slide.images.forEach(img => {
          content += \`<img src="\${img.src}" class="slide-image" width="\${img.width}" height="\${img.height}" />\`;
        });
      }
      
      if (slide.chart) {
        content += '<div style="margin-top: 20px;">' + renderChart(slide.chart, 600, 300) + '</div>';
      }
      
      slideEl.innerHTML = content;
      document.getElementById('counter').textContent = \`Slide \${index + 1} / \${slides.length}\`;
    }
    
    function nextSlide() {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }
    
    function prevSlide() {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
    }
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    });
    
    showSlide(0);
  </script>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'presentation.html';
    link.click();
    URL.revokeObjectURL(url);
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
      {slide.shapes && slide.shapes.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
          {slide.shapes.map((shape) => (
            <div key={shape.id}>
              {renderShape(shape)}
            </div>
          ))}
        </div>
      )}
      {slide.images && slide.images.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {slide.images.map((img) => (
            <img
              key={img.id}
              src={img.src}
              alt="Slide content"
              style={{
                width: img.width,
                height: img.height,
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          ))}
        </div>
      )}
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
                  <div className="sidebar-chart-container" style={{ marginTop: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {renderChart(slide.chart, 150, 80)}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Remove chart from this slide?")) removeChart(i);
                      }}
                      className="remove-btn"
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
            onClick={() => addSlide("blank")}
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
              <button onClick={() => setFilesMenuVisible(!filesMenuVisible)} style={{
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
                📁 Files
              </button>
              <button onClick={() => setInsertMenuVisible(!insertMenuVisible)} style={{
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
                ➕ Insert
              </button>
              <button onClick={() => setLayoutPickerVisible(true)} style={{
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
                🎨 Change Layout
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
            onDrop={handleSlideDrop}
            onDragOver={handleSlideDragOver}
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
            {currentSlide.texts.map((t) => {
              const pos = t.position || { x: 0, y: 0 };
              const size = t.size || { width: 300, height: 100 };
              return (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => handleTextDragStart(e, t.id)}
                  onClick={() => selectText(t.id)}
                  style={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y,
                    width: size.width,
                    height: size.height,
                    padding: 12,
                    border: t.id === selectedTextId ? "3px solid #667eea" : "2px solid transparent",
                    cursor: "move",
                    fontWeight: t.style.bold ? "bold" : "normal",
                    fontStyle: t.style.italic ? "italic" : "normal",
                    textDecoration: t.style.underline ? "underline" : "none",
                    fontSize: t.style.fontSize,
                    color: t.style.color || "#000000",
                    backgroundColor: t.id === selectedTextId ? "rgba(102, 126, 234, 0.05)" : "rgba(255,255,255,0.8)",
                    whiteSpace: "pre-wrap",
                    borderRadius: 8,
                    transition: "border 0.2s ease",
                    boxShadow: t.id === selectedTextId ? "0 4px 12px rgba(102, 126, 234, 0.15)" : "0 2px 4px rgba(0,0,0,0.1)",
                    overflow: "auto",
                  }}
                >
                  {t.text}
                  {t.id === selectedTextId && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("Delete this text box?")) {
                            deleteText(t.id);
                          }
                        }}
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          padding: "4px 10px",
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: 11,
                          fontWeight: 600,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          zIndex: 10,
                        }}
                      >
                        ✕ Delete
                      </button>
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const startX = e.clientX;
                          const startY = e.clientY;
                          const startWidth = size.width;
                          const startHeight = size.height;
                          
                          const handleMouseMove = (e) => {
                            const newWidth = startWidth + (e.clientX - startX);
                            const newHeight = startHeight + (e.clientY - startY);
                            handleTextResize(t.id, newWidth, newHeight);
                          };
                          
                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };
                          
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }}
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          width: 12,
                          height: 12,
                          background: "#667eea",
                          cursor: "nwse-resize",
                          borderRadius: "0 0 4px 0",
                        }}
                      />
                    </>
                  )}
                </div>
              );
            })}

            {/* Render shapes */}
            {currentSlide.shapes && currentSlide.shapes.map((shape) => {
              const pos = shape.position || { x: 0, y: 0 };
              const isHovered = hoveredShapeId === shape.id;
              return (
                <div
                  key={shape.id}
                  draggable
                  onDragStart={(e) => handleShapeDragStart(e, shape.id)}
                  onMouseEnter={() => setHoveredShapeId(shape.id)}
                  onMouseLeave={() => setHoveredShapeId(null)}
                  className="shape-container"
                  style={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y,
                    border: "2px solid #e2e8f0",
                    borderRadius: 8,
                    padding: 8,
                    background: "white",
                    cursor: "move",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  {renderShape(shape)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Remove this shape?")) {
                        removeShape(shape.id);
                      }
                    }}
                    className="remove-btn"
                    style={{
                      marginTop: 8,
                      padding: "6px 12px",
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Remove Shape
                  </button>
                  {isHovered && (
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startWidth = shape.width;
                        const startHeight = shape.height;
                        
                        const handleMouseMove = (e) => {
                          const newWidth = startWidth + (e.clientX - startX);
                          const newHeight = startHeight + (e.clientY - startY);
                          handleShapeResize(shape.id, newWidth, newHeight);
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 12,
                        height: 12,
                        background: "#667eea",
                        cursor: "nwse-resize",
                        borderRadius: "0 0 4px 0",
                      }}
                    />
                  )}
                </div>
              );
            })}

            {/* Render images */}
            {currentSlide.images && currentSlide.images.length > 0 && (
              <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 12 }}>
                {currentSlide.images.map((img) => (
                  <div
                    key={img.id}
                    style={{
                      position: "relative",
                      border: "2px solid #e2e8f0",
                      borderRadius: 8,
                      padding: 8,
                      background: "white",
                    }}
                  >
                    <img
                      src={img.src}
                      alt="Slide content"
                      style={{
                        width: img.width,
                        height: img.height,
                        objectFit: "contain",
                        borderRadius: 6,
                      }}
                    />
                    <button
                      onClick={() => {
                        if (window.confirm("Remove this image?")) {
                          removeImage(img.id);
                        }
                      }}
                      style={{
                        marginTop: 8,
                        width: "100%",
                        padding: "6px 12px",
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Render chart */}
            {currentSlide.chart && (() => {
              const pos = currentSlide.chart.position || { x: 0, y: 0 };
              const size = currentSlide.chart.size || { width: 400, height: 300 };
              return (
                <div
                  draggable
                  onDragStart={handleChartDragStart}
                  onMouseEnter={() => setHoveredChart(true)}
                  onMouseLeave={() => setHoveredChart(false)}
                  className="chart-container"
                  style={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y,
                    width: size.width,
                    height: size.height,
                    border: "2px solid #ddd",
                    padding: 10,
                    background: "white",
                    cursor: "move",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  {renderChart(currentSlide.chart, size.width - 20, size.height - 60)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Remove chart from this slide?")) {
                        removeChart();
                      }
                    }}
                    className="remove-btn"
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
                  {hoveredChart && (
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startWidth = size.width;
                        const startHeight = size.height;
                        
                        const handleMouseMove = (e) => {
                          const newWidth = startWidth + (e.clientX - startX);
                          const newHeight = startHeight + (e.clientY - startY);
                          handleChartResize(newWidth, newHeight);
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 12,
                        height: 12,
                        background: "#667eea",
                        cursor: "nwse-resize",
                        borderRadius: "0 0 4px 0",
                      }}
                    />
                  )}
                </div>
              );
            })()}
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

          {/* Files menu modal */}
          {filesMenuVisible && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1500,
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setFilesMenuVisible(false)}
            >
              <div
                style={{
                  background: "white",
                  padding: 32,
                  borderRadius: 16,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                  maxWidth: 500,
                  width: "90%",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 style={{ marginTop: 0, marginBottom: 24, color: "#2d3748", fontSize: 24, fontWeight: 700 }}>
                  📁 Files
                </h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <button
                    onClick={() => {
                      exportToJSON();
                      setFilesMenuVisible(false);
                    }}
                    style={{
                      padding: "14px 20px",
                      background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 15,
                      boxShadow: "0 2px 8px rgba(17, 153, 142, 0.3)",
                      transition: "all 0.3s ease",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    💾 Save as JSON
                  </button>

                  <label style={{
                    padding: "14px 20px",
                    background: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 15,
                    boxShadow: "0 2px 8px rgba(238, 9, 121, 0.3)",
                    transition: "all 0.3s ease",
                    display: "block",
                    textAlign: "left",
                  }}>
                    📂 Load from JSON
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        importFromJSON(e);
                        setFilesMenuVisible(false);
                      }}
                      style={{ display: "none" }}
                    />
                  </label>

                  <button
                    onClick={() => {
                      exportToHTML();
                      setFilesMenuVisible(false);
                    }}
                    style={{
                      padding: "14px 20px",
                      background: "linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 15,
                      boxShadow: "0 2px 8px rgba(252, 70, 107, 0.3)",
                      transition: "all 0.3s ease",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    📄 Export as HTML
                  </button>
                </div>

                <button
                  onClick={() => setFilesMenuVisible(false)}
                  style={{
                    marginTop: 24,
                    width: "100%",
                    padding: "12px 20px",
                    background: "#e2e8f0",
                    color: "#4a5568",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                    transition: "all 0.3s ease",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Insert menu modal */}
          {insertMenuVisible && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1500,
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setInsertMenuVisible(false)}
            >
              <div
                style={{
                  background: "white",
                  padding: 32,
                  borderRadius: 16,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                  maxWidth: 600,
                  width: "90%",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 style={{ marginTop: 0, marginBottom: 24, color: "#2d3748", fontSize: 24, fontWeight: 700 }}>
                  Insert
                </h2>
                
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "#4a5568", marginBottom: 12 }}>📝 Text</h3>
                  <button
                    onClick={() => {
                      addText();
                      setInsertMenuVisible(false);
                    }}
                    style={{
                      padding: "12px 24px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 14,
                      boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    📝 Add Text Box
                  </button>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "#4a5568", marginBottom: 12 }}>📷 Images</h3>
                  <label style={{
                    display: "inline-block",
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                    transition: "all 0.3s ease",
                  }}>
                    🖼️ Upload Image from Device
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        addImage(e);
                        setInsertMenuVisible(false);
                      }}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>

                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "#4a5568", marginBottom: 12 }}>🔷 Shapes</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
                    <button
                      onClick={() => addShape('rectangle')}
                      style={{
                        padding: 16,
                        background: "white",
                        border: "2px solid #e2e8f0",
                        borderRadius: 8,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#667eea";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div style={{ width: 60, height: 40, backgroundColor: "#667eea", borderRadius: 4 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#4a5568" }}>Rectangle</span>
                    </button>

                    <button
                      onClick={() => addShape('circle')}
                      style={{
                        padding: 16,
                        background: "white",
                        border: "2px solid #e2e8f0",
                        borderRadius: 8,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#667eea";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div style={{ width: 50, height: 50, backgroundColor: "#f28e2b", borderRadius: "50%" }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#4a5568" }}>Circle</span>
                    </button>

                    <button
                      onClick={() => addShape('triangle')}
                      style={{
                        padding: 16,
                        background: "white",
                        border: "2px solid #e2e8f0",
                        borderRadius: 8,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#667eea";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div style={{
                        width: 0,
                        height: 0,
                        borderLeft: "25px solid transparent",
                        borderRight: "25px solid transparent",
                        borderBottom: "45px solid #e15759",
                      }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#4a5568" }}>Triangle</span>
                    </button>

                    <button
                      onClick={() => addShape('arrow')}
                      style={{
                        padding: 16,
                        background: "white",
                        border: "2px solid #e2e8f0",
                        borderRadius: 8,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#667eea";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <svg width="60" height="30" viewBox="0 0 100 50">
                        <defs>
                          <marker id="arrowhead-preview" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                            <polygon points="0 0, 10 3, 0 6" fill="#76b7b2" />
                          </marker>
                        </defs>
                        <line x1="0" y1="25" x2="90" y2="25" stroke="#76b7b2" strokeWidth="4" markerEnd="url(#arrowhead-preview)" />
                      </svg>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#4a5568" }}>Arrow</span>
                    </button>

                    <button
                      onClick={() => addShape('star')}
                      style={{
                        padding: 16,
                        background: "white",
                        border: "2px solid #e2e8f0",
                        borderRadius: 8,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#667eea";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <svg width="50" height="50" viewBox="0 0 100 100">
                        <polygon
                          points="50,10 61,40 95,40 68,60 79,90 50,70 21,90 32,60 5,40 39,40"
                          fill="#59a14f"
                        />
                      </svg>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#4a5568" }}>Star</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setInsertMenuVisible(false)}
                  style={{
                    marginTop: 24,
                    width: "100%",
                    padding: "12px 20px",
                    background: "#e2e8f0",
                    color: "#4a5568",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                    transition: "all 0.3s ease",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Layout picker modal */}
          {layoutPickerVisible && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1500,
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setLayoutPickerVisible(false)}
            >
              <div
                style={{
                  background: "white",
                  padding: 32,
                  borderRadius: 16,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                  maxWidth: 800,
                  width: "90%",
                  maxHeight: "80vh",
                  overflowY: "auto",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 style={{ marginTop: 0, marginBottom: 24, color: "#2d3748", fontSize: 24, fontWeight: 700 }}>
                  Choose a Layout
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 16,
                  }}
                >
                  {Object.entries(LAYOUTS).map(([key, layout]) => (
                    <div
                      key={key}
                      onClick={() => applyLayout(key)}
                      style={{
                        padding: 16,
                        border: currentSlide.layout === key ? "3px solid #667eea" : "2px solid #e2e8f0",
                        borderRadius: 12,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        backgroundColor: currentSlide.layout === key ? "#f7fafc" : "white",
                        boxShadow: currentSlide.layout === key ? "0 4px 12px rgba(102, 126, 234, 0.2)" : "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                      onMouseEnter={(e) => {
                        if (currentSlide.layout !== key) {
                          e.currentTarget.style.borderColor = "#667eea";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentSlide.layout !== key) {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      <div style={{ fontSize: 40, textAlign: "center", marginBottom: 8 }}>
                        {layout.icon}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, textAlign: "center", color: "#2d3748" }}>
                        {layout.name}
                      </div>
                      <div
                        style={{
                          marginTop: 12,
                          padding: 8,
                          background: layout.backgroundColor || "#f7fafc",
                          borderRadius: 6,
                          minHeight: 60,
                          fontSize: 8,
                          color: "#4a5568",
                        }}
                      >
                        {layout.texts.map((t, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontWeight: t.style.bold ? "bold" : "normal",
                              fontStyle: t.style.italic ? "italic" : "normal",
                              fontSize: Math.max(6, t.style.fontSize * 0.15),
                              color: t.style.color,
                              marginBottom: 2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {t.text.split("\n")[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setLayoutPickerVisible(false)}
                  style={{
                    marginTop: 24,
                    width: "100%",
                    padding: "12px 20px",
                    background: "#e2e8f0",
                    color: "#4a5568",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                    transition: "all 0.3s ease",
                  }}
                >
                  Close
                </button>
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

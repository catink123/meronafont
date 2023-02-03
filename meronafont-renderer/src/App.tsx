import { useEffect, useRef, useState } from 'react';
import './App.css'
import { loadFont } from './lib/MeronaFontLoader';
import { renderText, PreloadedFont, preloadFont } from './lib/MeronaFontRenderer';

function App() {
  const [preloadedFont, setPreloadedFont] = useState<PreloadedFont>();
  const [text, setText] = useState<string>('');
  const renderCanvasRef = useRef<HTMLCanvasElement>(null);

  let c: CanvasRenderingContext2D | undefined;
  if (renderCanvasRef.current) c = renderCanvasRef.current.getContext('2d')!;

  function draw() {
    if (!c || !preloadedFont) return;
    c.clearRect(0, 0, renderCanvasRef.current!.width, renderCanvasRef.current!.height);

    c.textAlign = 'center';
    c.textBaseline = 'middle';
    renderText(c, text, preloadedFont, renderCanvasRef.current!.width / 2, renderCanvasRef.current!.height / 2);
  }

  useEffect(() => {
    requestAnimationFrame(draw);
  }, [text]);

  function openFontSelection() {
    let input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', async (e: any) => {
      if (e.currentTarget.files.length === 0) return;
      const font = await loadFont(e.currentTarget.files[0]);
      const preloadedFont = await preloadFont(font);
      setPreloadedFont(preloadedFont);
    });
    input.click();
  }

  function handleTextChange(e: any) {
    setText(e.currentTarget.value);
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 10, marginBottom: 10 }}>
        <label>
          Text:&nbsp;
          <input type="text" value={text} onInput={handleTextChange} />
        </label>
        <button onClick={openFontSelection}>Load font from UMF</button>
      </div>
      <canvas 
        style={{border: '1px solid gray'}}
        width={500}
        height={500}
        ref={renderCanvasRef}
      />
    </>
  )
}

export default App

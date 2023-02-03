import './RectEditor.css';
import { CharacterizedRectangle } from './Editor';
import { CHARACTERS } from './lib/MeronaFontLoader';

interface RectEditorProps {
  rectangle: CharacterizedRectangle;
  onChange: (changedRectangle: CharacterizedRectangle) => void;
}

export default function RectEditor({ rectangle, onChange }: RectEditorProps) {
  function handleChange(propName: keyof CharacterizedRectangle, propValue: any) {
    onChange({
      ...rectangle,
      [propName]: propValue
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label>
        Character:&nbsp;
        <select value={rectangle.character} onChange={(e: any) => handleChange('character', e.target.value)}>
          {CHARACTERS.map(char => (
            <option key={char} value={char}>{char}</option>
          ))}
        </select>
      </label>
      <label>
        X:&nbsp;
        <input
          type="number"
          value={rectangle.x}
          onInput={(e: any) => handleChange('x', Number(e.target.value))}
        />
      </label>
      <label>
        Y:&nbsp;
        <input
          type="number"
          value={rectangle.y}
          onInput={(e: any) => handleChange('y', Number(e.target.value))}
        />
      </label>
      <label>
        Width:&nbsp;
        <input
          type="number"
          value={rectangle.width}
          onInput={(e: any) => handleChange('width', Number(e.target.value))}
        />
      </label>
      <label>
        Height:&nbsp;
        <input
          type="number"
          value={rectangle.height}
          onInput={(e: any) => handleChange('height', Number(e.target.value))}
        />
      </label>
      Margin: <br />
      <label>
        &emsp;Top:&nbsp;
        <input
          type="number"
          value={rectangle.margin.top}
          onInput={(e: any) => handleChange('margin', { ...rectangle.margin, top: Number(e.target.value) })}
        />
      </label>
      <label>
        &emsp;Right:&nbsp;
        <input
          type="number"
          value={rectangle.margin.right}
          onInput={(e: any) => handleChange('margin', { ...rectangle.margin, right: Number(e.target.value) })}
        />
      </label>
      <label>
        &emsp;Bottom:&nbsp;
        <input
          type="number"
          value={rectangle.margin.bottom}
          onInput={(e: any) => handleChange('margin', { ...rectangle.margin, bottom: Number(e.target.value) })}
        />
      </label>
      <label>
        &emsp;Left:&nbsp;
        <input
          type="number"
          value={rectangle.margin.left}
          onInput={(e: any) => handleChange('margin', { ...rectangle.margin, left: Number(e.target.value) })}
        />
      </label>
    </div>
  )
}
import { Rectangle } from "./Editor";

export default function RectTable({ rectangles }: { rectangles: Rectangle[] }) {
  return (
    <table>
      <caption>Rectangles</caption>
      <tbody>
        <tr>
          <th>ID</th>
          <th>X</th>
          <th>Y</th>
          <th>Width</th>
          <th>Height</th>
        </tr>
        {rectangles.map((rect, i) => (
          <tr>
            <td>{i}</td>
            <td>{rect.x}</td>
            <td>{rect.y}</td>
            <td>{rect.width}</td>
            <td>{rect.height}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
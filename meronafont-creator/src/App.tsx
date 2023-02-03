import React, { ReactElement, useState } from 'react';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './App.css';
import Editor from './Editor';
// import { AppBar, Button, Menu, MenuItem, Toolbar, Typography } from '@mui/material';

// type ToolbarMenu = { label: string }[];
// interface ToolbarItem {
//   items: ToolbarMenu;
// }
// const toolbarItems: Map<string, ToolbarItem> = new Map([
//   ['File', {
//     items: [
//       {
//         label: 'New'
//       },
//       {
//         label: 'Open'
//       },
//       {
//         label: 'Save'
//       }
//     ]
//   }],
//   ['Edit', {
//     items: [
//       {
//         label: 'Undo'
//       },
//       {
//         label: 'Cut'
//       },
//       {
//         label: 'Copy'
//       },
//       {
//         label: 'Paste'
//       }
//     ]
//   }]
// ]);

// function App() {
//   const [menuAnchor, setMenuAnchor] = useState<HTMLElement | undefined>();
//   const [currentMenu, setCurrentMenu] = useState<ToolbarMenu>();

//   function handleMenuClick(e: React.MouseEvent<HTMLButtonElement>) {
//     setMenuAnchor(e.currentTarget);
//   }

//   return (
//     <>
//       <AppBar>
//         <Toolbar variant="dense">
//         <Typography variant="h6">HandFont Creator</Typography>
//           {Array.from(toolbarItems.keys()).map(key => (
//             <Button color="inherit" variant="text" onClick={(e) => { setCurrentMenu(toolbarItems.get(key)!.items); handleMenuClick(e) }} key={key}>{key}</Button>
//           ))}
//         </Toolbar>
//       </AppBar>
//       <Menu open={Boolean(menuAnchor)} anchorEl={menuAnchor}>
//         {currentMenu?.map(val => (
//           <MenuItem onClick={() => setMenuAnchor(undefined)} key={val.label}>{val.label}</MenuItem>
//         ))}
//       </Menu>
//     </>
//   )
// }

function App() {
  return (
    <Editor />
  )
}

export default App

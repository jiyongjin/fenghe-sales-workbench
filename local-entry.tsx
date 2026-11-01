/*!
 * Copyright (c) 2026 风禾永进 (https://yongjin.tech)
 * SPDX-License-Identifier: MIT
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import Workbench from './components/workbench/Workbench';
import './components/workbench/workbench.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><Workbench /></React.StrictMode>);

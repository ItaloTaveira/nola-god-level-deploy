import React, { createContext, useContext, useState } from 'react'

const PanelContext = createContext()

export function PanelProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [payload, setPayload] = useState(null)

  function openPanel(data) {
    setPayload(data)
    setOpen(true)
  }

  function closePanel() {
    setOpen(false)
    setTimeout(() => setPayload(null), 300)
  }

  // expose a small global helper so Chart onClick handlers (non-hook contexts) can open the panel
  // this is a pragmatic shortcut for this demo app
  React.useEffect(() => {
    window.__OPEN_PANEL = openPanel
    return () => { window.__OPEN_PANEL = undefined }
  }, [])

  return (
    <PanelContext.Provider value={{ open, payload, openPanel, closePanel }}>
      {children}
    </PanelContext.Provider>
  )
}

export function usePanel() {
  return useContext(PanelContext)
}

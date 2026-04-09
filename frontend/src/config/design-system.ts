// Global Design System - CleverArchivesDashboard
// Enforces 'Proportional Responsiveness' and 'Zero Hardcode' across the dashboard.
// UPDATED: Compact Scales to prevent oversized elements on laptop screens.

export const DESIGN = {
  // --- COMPACT TYPOGRAPHY ---
  TEXT: {
    H1: "text-xl md:text-2xl lg:text-3xl font-bold tracking-tight", // Shrunk from 4xl
    H3: "text-sm md:text-base font-bold",                         // Shrunk from xl
    LABEL: "text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50",
    S_TITLE: "text-xs md:text-sm font-bold text-slate-700",       // Shrunk from base
    BODY: "text-[11px] md:text-xs lg:text-sm leading-relaxed",      // Shrunk
    CAPTION: "text-[9px] md:text-[10px] font-medium text-muted-foreground/40 italic",
    STATUS: "text-[9px] font-extrabold uppercase tracking-widest",
  },

  // --- COMPACT ADAPTIVE SPACING ---
  SPACE: {
    PAGE_PAD: "px-6 py-5",
    PANEL_GAP: "gap-3 md:gap-5",
    ITEM_GAP: "gap-2 md:gap-3 flex flex-col",
    INNER_PAD: "p-3 md:p-5",
    W_HEADER: "px-5 md:px-7 py-3 md:py-4",
    W_CONTENT: "px-5 md:px-7 pt-2 pb-4",
    W_FOOTER: "px-6 md:px-8 py-3 md:py-4",
  },

  // --- COMPONENT STYLING ---
  STYLING: {
    PAGE_DASHBOARD: "h-[calc(100vh-80px)] overflow-hidden flex flex-col lg:flex-row",
    PANEL_OUTER: "flex-1 min-w-0 h-full flex flex-col",
    PANEL_OUTER_XP: "flex-[1.2] min-w-0 h-full flex flex-col",
    PANEL_BASE: "h-full flex flex-col",
    FLEX_1: "flex-1 min-h-0", 
    SHRINK_0: "shrink-0",
    
    HEADER_WRAP: "flex items-center gap-2 md:gap-3",
    ICON_BOX: (variant: 'primary' | 'warning' | 'info' | 'danger') => {
      const colors = {
        primary: "bg-primary/5 text-primary", // Thinner tint
        warning: "bg-warning/5 text-warning",
        info: "bg-info/5 text-info",
        danger: "bg-danger/5 text-danger"
      };
      return `w-7 h-7 md:w-9 md:h-9 rounded-lg flex items-center justify-center shadow-none ${colors[variant]}`;
    },

    EMPTY_CARD: "py-6 md:py-10 border-none bg-transparent shadow-none",
    EMPTY_ICON: 24,
    
    BTN_SUBMIT_SM: "rounded-xl font-bold h-9 md:h-10 px-4 active:scale-95 transition-all text-[9px] md:text-[10px] uppercase tracking-widest",
    BTN_SUBMIT_LG: "rounded-xl font-bold h-11 md:h-12 text-[10px] md:text-xs shadow-md shadow-primary/10",
    BTN_VIVID_BLUE: "rounded-xl font-bold h-11 md:h-12 text-[10px] md:text-xs bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/10 active:scale-95 transition-all",
    
    VAR_PRIMARY: "primary" as const,
    VAR_WARNING: "warning" as const,
    VAR_DANGER: "danger" as const,
    VAR_OUTLINE: "outline" as const,
  },

  LAYOUT: {
    SIDEBAR: "w-full md:w-[320px] lg:w-[360px] shrink-0",
    MAIN: "flex-1 min-w-0 h-full",
    HEADER_H: "h-14 md:h-16",
    TAB_H: "h-[52px]",
  },

  ANIM: { STAGGER_DELAY: 0.04, EXIT_SCALE: 0.97 },
  ICON: {
    HEADER: 14,
    ACTION: 10,
    STAKE: 14,
    LOAD: 10,
    STROKE: 1.5,
    STROKE_BOLD: 2
  }
};

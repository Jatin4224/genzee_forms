"use client";

import * as React from "react";
import Link, { type LinkProps } from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";

import { cn } from "~/lib/utils";

export interface SidebarLinkItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = React.useState(false);

  const open = openProp ?? openState;
  const setOpen = setOpenProp ?? setOpenState;

  //honor prefers-reduced-motion: when set, snap instead of animating width/labels
  const prefersReduced = useReducedMotion();
  const resolvedAnimate = animate && !prefersReduced;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: resolvedAnimate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "hidden h-full w-[300px] shrink-0 flex-col border-r border-border/40 bg-sidebar/50 px-4 py-4 backdrop-blur-xl md:flex",
        className,
      )}
      animate={{ width: animate ? (open ? "300px" : "72px") : "300px" }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={cn(
        "flex h-12 w-full flex-row items-center justify-between border-b border-border/40 bg-sidebar/60 px-4 py-4 backdrop-blur-xl md:hidden",
      )}
      {...props}
    >
      <div className="z-20 flex w-full justify-end">
        <IconMenu2
          className="cursor-pointer text-foreground"
          onClick={() => setOpen(!open)}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed inset-0 z-100 flex h-full w-full flex-col justify-between bg-sidebar p-10",
              className,
            )}
          >
            <div
              className="absolute top-10 right-10 z-50 cursor-pointer text-foreground"
              onClick={() => setOpen(!open)}
            >
              <IconX />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: SidebarLinkItem;
  className?: string;
} & Omit<LinkProps, "href">) => {
  const { open, animate } = useSidebar();
  return (
    <Link
      href={link.href}
      className={cn(
        "group/sidebar flex items-center justify-start gap-2 rounded-md py-2 text-foreground hover:bg-sidebar-accent hover:px-2 hover:text-sidebar-accent-foreground transition-[padding,background-color] duration-150",
        className,
      )}
      {...props}
    >
      {link.icon}
      <motion.span
        animate={{ opacity: animate ? (open ? 1 : 0) : 1 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="m-0! inline-block whitespace-pre p-0! text-sm transition-transform duration-150 group-hover/sidebar:translate-x-1"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};

//an animated label that appears/hides with the sidebar (for non-link rows: brand, user)
export const SidebarLabel = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  return (
    <motion.span
      animate={{ opacity: animate ? (open ? 1 : 0) : 1 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn("inline-block overflow-hidden whitespace-pre text-sm", className)}
    >
      {children}
    </motion.span>
  );
};

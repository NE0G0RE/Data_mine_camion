/// <reference types="react" />
import '@radix-ui/react-icons';
import '@radix-ui/react-accordion';
import '@radix-ui/react-alert-dialog';
import '@radix-ui/react-avatar';
import '@radix-ui/react-checkbox';
import '@radix-ui/react-dialog';
import '@radix-ui/react-dropdown-menu';
import '@radix-ui/react-label';
import '@radix-ui/react-menubar';
import '@radix-ui/react-navigation-menu';
import '@radix-ui/react-popover';
import '@radix-ui/react-progress';
import '@radix-ui/react-select';
import '@radix-ui/react-separator';
import '@radix-ui/react-slot';
import '@radix-ui/react-switch';
import '@radix-ui/react-tabs';
import '@radix-ui/react-toast';
import '@radix-ui/react-toggle';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
      button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
      label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
      table: React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
      thead: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
      tbody: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
      tr: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
      th: React.DetailedHTMLProps<React.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
      td: React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
    }
  }
}

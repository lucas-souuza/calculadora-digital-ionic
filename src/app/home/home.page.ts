import { Component, HostListener } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { backspaceOutline, calculatorOutline } from 'ionicons/icons';

@Component({ selector: 'app-home', templateUrl: './home.page.html', styleUrls: ['./home.page.scss'], standalone: true, imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonButton, IonIcon] })
export class HomePage {
  display = '0';
  expression = '';
  justEvaluated = false;
  constructor() { addIcons({ backspaceOutline, calculatorOutline }); }
  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    const key = event.key;
    if (/^[0-9.]$/.test(key) || ['+', '-', '*', '/'].includes(key)) { event.preventDefault(); this.press(({ '-': '−', '*': '×', '/': '÷' } as Record<string,string>)[key] ?? key); }
    else if (key === 'Enter' || key === '=') { event.preventDefault(); this.press('='); }
    else if (key === 'Backspace') { event.preventDefault(); this.press('⌫'); }
    else if (key === 'Escape') { this.press('AC'); }
  }
  press(key: string) {
    if (key === 'AC') { this.display = '0'; this.expression = ''; this.justEvaluated = false; return; }
    if (key === '⌫') { if (this.justEvaluated) { this.display = '0'; this.expression = ''; this.justEvaluated = false; return; } this.expression = this.expression.slice(0, -1); this.display = this.expression || '0'; return; }
    if (key === '=') { this.calculate(); return; }
    const isOperator = ['+', '−', '×', '÷'].includes(key);
    if (this.justEvaluated && !isOperator) this.expression = '';
    this.justEvaluated = false;
    const token = ({ '−': '-', '×': '*', '÷': '/' } as Record<string,string>)[key] ?? key;
    if (isOperator && /[+\-*/]$/.test(this.expression)) this.expression = this.expression.slice(0, -1);
    if (key === '.') { const current = this.expression.split(/[+\-*/]/).pop() ?? ''; if (current.includes('.')) return; if (!current) this.expression += '0'; }
    this.expression += token;
    this.display = this.expression.replaceAll('*','×').replaceAll('/','÷').replaceAll('-','−');
  }
  calculate() {
    if (!this.expression || /[+\-*/.]$/.test(this.expression)) return;
    try {
      const result = this.evaluate(this.expression);
      if (!Number.isFinite(result)) { this.display = 'Não é possível dividir por zero'; this.expression = ''; this.justEvaluated = true; return; }
      const clean = Number(result.toPrecision(12)).toString();
      this.display = clean; this.expression = clean; this.justEvaluated = true;
    } catch { this.display = 'Expressão inválida'; this.expression = ''; this.justEvaluated = true; }
  }
  private evaluate(input: string): number {
    const tokens = input.match(/(?:\d*\.\d+|\d+\.?\d*|[+\-*/])/g);
    if (!tokens || tokens.join('') !== input) throw Error();
    const values: number[] = []; const ops: string[] = [];
    const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const apply = () => { const op = ops.pop()!; const b = values.pop()!; const a = values.pop()!; values.push(op === '+' ? a+b : op === '-' ? a-b : op === '*' ? a*b : a/b); };
    let expectNumber = true;
    for (const t of tokens) {
      if (/^\d/.test(t)) { if (!expectNumber) throw Error(); values.push(Number(t)); expectNumber = false; }
      else if (t === '-' && expectNumber) values.push(0);
      else { if (expectNumber) throw Error(); while (ops.length && precedence[ops.at(-1)!] >= precedence[t]) apply(); ops.push(t); expectNumber = true; }
    }
    if (expectNumber) throw Error(); while (ops.length) apply(); return values[0];
  }
}



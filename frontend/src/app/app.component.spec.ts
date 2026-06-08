import { describe, it, expect } from 'vitest';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('should create the component', () => {
    const component = new AppComponent();
    expect(component).toBeTruthy();
  });

  it('should have title "seguridad-paciente"', () => {
    const component = new AppComponent();
    expect(component.title).toBe('seguridad-paciente');
  });
});

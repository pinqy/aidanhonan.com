import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';

@Injectable({providedIn: 'root'})
export class SizeService {
  // Reference: https://material.angular.dev/cdk/layout/overview
  private breakpointObserver = inject(BreakpointObserver);
  private readonly trackedBreakpoints = [Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge];

  private _currentBreakpoint: WritableSignal<string> = signal('');

  // ReadOnly signals for components to use
  readonly currentBreakpoint: Signal<string> = this._currentBreakpoint.asReadonly();
  readonly isXSmall: Signal<boolean> = computed(() => this._currentBreakpoint() === Breakpoints.XSmall);
  readonly isSmall: Signal<boolean> = computed(() => this._currentBreakpoint() === Breakpoints.Small);
  readonly isMedium: Signal<boolean> = computed(() => this._currentBreakpoint() === Breakpoints.Medium);
  readonly isLarge: Signal<boolean> = computed(() => this._currentBreakpoint() === Breakpoints.Large);
  readonly isXLarge: Signal<boolean> = computed(() => this._currentBreakpoint() === Breakpoints.XLarge);

  constructor() {
    this.breakpointObserver.observe(this.trackedBreakpoints).subscribe((state) => this.updateCurrentBreakpoint(state));
  }

  private updateCurrentBreakpoint(state: BreakpointState): void {
    // find first active breakpoint (the ones I'm using should be non-overlapping based on the docs)
    const firstActiveBreakpoint = this.trackedBreakpoints.find((tb) => state.breakpoints[tb]);
    if (firstActiveBreakpoint) {
      this._currentBreakpoint.set(firstActiveBreakpoint);
    }
  }
}
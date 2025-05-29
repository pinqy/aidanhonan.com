import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BackendProxy } from '../../../proxy/backend-proxy';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-backend-test',
  standalone: true,
  imports: [AsyncPipe, CommonModule],
  templateUrl: './backend-test.component.html',
  styleUrl: './backend-test.component.scss'
})
export class BackendTestComponent {
  private backendProxy = inject(BackendProxy);

  testString$!: Observable<string>;

  constructor() {
    this.testString$ = this.backendProxy.test();
  }
}

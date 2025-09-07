import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BackendProxy } from '../../../proxy/backend-proxy';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-backend-test',
  standalone: true,
  imports: [AsyncPipe, CommonModule],
  templateUrl: './backend-test.html',
  styleUrl: './backend-test.scss'
})
export class BackendTestComponent {
  private backendProxy = inject(BackendProxy);

  testString$!: Observable<string>;

  constructor() {
    this.testString$ = this.backendProxy.test();
  }
}

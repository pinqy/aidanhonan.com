import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  headerText = "AidanHonan.com";
  repoLink = "https://github.com/pinqy/aidanhonan.com";
}

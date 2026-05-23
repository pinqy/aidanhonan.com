import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SizeService } from '../../services/size-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  sizeService = inject(SizeService);

  repoLink = 'https://github.com/pinqy/aidanhonan.com';
  
  headerText = computed(() => this.sizeService.isXSmall() ? 'AH' : 'AidanHonan.com'); // replace this change with a dropdown for menu items
  homeLinkSize = computed(() => (this.sizeService.isXSmall() || this.sizeService.isSmall()) ? '1.6rem' : '2rem');
}

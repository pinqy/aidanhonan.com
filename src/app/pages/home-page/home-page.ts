import { Component, computed, inject } from '@angular/core';
import { SizeService } from '../../../services/size-service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss'
})
export class HomePageComponent {
  sizeService = inject(SizeService);
  bannerTextSize = computed(() => {
    if (this.sizeService.isXSmall()) {return "2rem"}
    else if (this.sizeService.isSmall()) {return "2.25rem"}
    else if (this.sizeService.isMedium()) {return "2.75rem"}
    else if (this.sizeService.isLarge()) {return "3.5rem"}
    else if (this.sizeService.isXLarge()) {return "4rem"}
    else {return "2.5rem"}
  })
}

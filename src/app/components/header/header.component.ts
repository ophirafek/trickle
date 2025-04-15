import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() showMenuToggle: boolean = false;
  @Output() menuToggle = new EventEmitter<void>();
  
  toggleMenu(): void {
    this.menuToggle.emit();
  }
}
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.css'
})
export class TasksListComponent {

  @Input() tasks: any;
  @Input() loading: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}

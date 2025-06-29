import { Component } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Task } from '../../../model/types';
import { TasksListComponent } from '../tasks-list/tasks-list.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
  imports: [TasksListComponent]
})
export class TasksComponent {

  loading: boolean = false;
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  activeStatus: string = 'all';
  searchTerm: string = '';
  sortBy: string = 'value';

  constructor(private tasksService: TaskService) { }

  ngOnInit(): void {
    this.tasksService.getTasks()
      .subscribe({
        next: (tasks) => {
          this.tasks = tasks;
        },
        error: (err) => {
          console.error('Error loading tasks:', err);
        }
      });

  }

  openTaskDetail(ev: Event): void { }

  createNewTask(): void { }
}

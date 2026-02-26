import { Component } from '@angular/core';
import { Meals } from './meals/meals';
import { DietGraph } from './dailyDiet/diet-graph/diet-graph';
import { Graph } from '../dash/graph/graph';


@Component({
  selector: 'app-diet-plans',
  imports: [Meals,DietGraph,Graph],
  templateUrl: './diet-plans.html',
  styleUrl: './diet-plans.css',
})
export class DietPlans {

}

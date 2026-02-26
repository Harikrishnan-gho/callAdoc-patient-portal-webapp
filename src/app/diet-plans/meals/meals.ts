import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'meals',
  imports: [MatIcon,MatCard,MatDivider],
  templateUrl: './meals.html',
  styleUrl: './meals.css',
})
export class Meals {

  date = new Date();

formattedDate!: string;
expanded?: boolean;

ngOnInit() {
  this.formattedDate = this.date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
toggle(pack: any) {
  pack.expanded = !pack.expanded;
}

diet = [
  {
    title:"Breakfast",
    type:" 2 Food",
    img:"diet-plan/breakfast.png",
    cal:"421",
    tCal:"1428",
    expanded: false,
    host:"2 serving baked banana-nut oatmeal cups, 2 clementines",
    timeSpan:"Nice job!",
    suggest:"286 kcal added to today's intake.",
    mark:"Mark as not taken"
  },
  {
    title:"AM snack",
    type:" 2 Food",
    img:"diet-plan/pappaya.png",
    cal:"286",
    tCal:"1428",
    expanded: false,
    host:"2 serving baked banana-nut oatmeal cups, 2 clementines",
    timeSpan:"Nice job!",
    suggest:"286 kcal added to today's intake.",
    mark:"Mark as not taken"
  },
  {
    title:"Lunch",
    type:"3 Food:",
    img:"diet-plan/lunch.png",
    cal:"440",
    tCal:"1428",
    expanded: false,
    host:"Veggie & Hummus Sandwich, 1 oz. Cheddar cheese",
    timeSpan:"Time for your lunch 🍽️",
    suggest:"Stay on track ⎯ next meal coming up",
    mark:"Mark as taken"
  },
  {
    title:"PM snack",
    type:"3 Food:",
    img:"diet-plan/pmSnack.png",
    cal:"440",
    tCal:"1428",
    expanded: false,
    host:"Veggie & Hummus Sandwich, 1 oz. Cheddar cheese",
    timeSpan:"Time for your lunch 🍽️",
    suggest:"Stay on track ⎯ next meal coming up",
    mark:"Mark as taken"
  },
  {
    title:"Dinner",
    type:"3 Food:",
    img:"diet-plan/dinner.png",
    cal:"440",
    tCal:"1428",
    expanded: false,
    host:"Veggie & Hummus Sandwich, 1 oz. Cheddar cheese",
    timeSpan:"Time for your lunch 🍽️",
    suggest:"Stay on track ⎯ next meal coming up",
    mark:"Mark as taken"
  },
]
}

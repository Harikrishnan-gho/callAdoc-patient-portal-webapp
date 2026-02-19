import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'nutrition',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './nutrition.html',
  styleUrl: './nutrition.css',
})
export class Nutrition {

  // nutrition section
  title: string;
  image: string;
  whocanavail: string;
  features: string[];
  prices: {
    amount: number;
    duration: string;
  }[];

  nutritionPackage = [
    {
      title: 'Diabetes Management',
      image: 'dashboard/nutrition/diabetics.png',
      whocanavail: 'Type 2 Diabetes, Prediabetes, Gestational Diabetes Mellitus (GDM), Insulin Resistance',
      features: [
        '1-on-1 Initial Dietitian Consultation',
        'Personalized Weekly Diet Plans',
        'Weekly Follow-up Consultation',
        'Basic Carb Counting & Glycemic Index Guidance',
        'Portion Control & Meal Timing Strategies',
        'Snack & Recipe Suggestions',
        'Chat-In Support'
      ],
      prices: [
        { amount: 599, duration: '5 Weeks' },
        { amount: 999, duration: '10 Weeks' },
        { amount: 1699, duration: '15 Weeks' },
        { amount: 1899, duration: '20 Weeks' }
      ],
    },

    {
      title: 'Cholesterol & Heart Management',
      image: 'dashboard/nutrition/cholestrol.png',
      whocanavail: 'Type 2 Diabetes, Prediabetes, Gestational Diabetes Mellitus (GDM), Insulin Resistance',
      features: [
        '1-on-1 Initial Dietitian Consultation',
        'Personalized Weekly Diet Plans',
        'Weekly Follow-up Consultation',
        'Basic Carb Counting & Glycemic Index Guidance',
        'Portion Control & Meal Timing Strategies',
        'Snack & Recipe Suggestions',
        'Chat-In Support'
      ],
      prices: [
        { amount: 599, duration: '5 Weeks' },
        { amount: 999, duration: '10 Weeks' },
        { amount: 1699, duration: '15 Weeks' },
        { amount: 1899, duration: '20 Weeks' }
      ],
    },
    {
      title: 'PCOD/PCOS Management',
      image: 'dashboard/nutrition/pcod.png',
      whocanavail: 'Type 2 Diabetes, Prediabetes, Gestational Diabetes Mellitus (GDM), Insulin Resistance',
      features: [
        '1-on-1 Initial Dietitian Consultation',
        'Personalized Weekly Diet Plans',
        'Weekly Follow-up Consultation',
        'Basic Carb Counting & Glycemic Index Guidance',
        'Portion Control & Meal Timing Strategies',
        'Snack & Recipe Suggestions',
        'Chat-In Support'
      ],
      prices: [
        { amount: 599, duration: '5 Weeks' },
        { amount: 999, duration: '10 Weeks' },
        { amount: 1699, duration: '15 Weeks' },
        { amount: 1899, duration: '20 Weeks' }
      ],
    },
    {
      title: 'kidney stone',
      image: 'dashboard/nutrition/pcod.png',
      whocanavail: 'Type 2 Diabetes, Prediabetes, Gestational Diabetes Mellitus (GDM), Insulin Resistance',
      features: [
        '1-on-1 Initial Dietitian Consultation',
        'Personalized Weekly Diet Plans',
        'Weekly Follow-up Consultation',
        'Basic Carb Counting & Glycemic Index Guidance',
        'Portion Control & Meal Timing Strategies',
        'Snack & Recipe Suggestions',
        'Chat-In Support'
      ],
      prices: [
        { amount: 599, duration: '5 Weeks' },
        { amount: 999, duration: '10 Weeks' },
        { amount: 1699, duration: '15 Weeks' },
        { amount: 1899, duration: '20 Weeks' }
      ],
    },

  ]

  currentPage = 1;
  itemsPerPage = 3;

  get paginatedPackages() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.nutritionPackage.slice(start, end);
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.nutritionPackage.length) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

}

import { Routes } from '@angular/router';

import { LoginComponent } from './features/login/login.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () => { return import('./features/login/login.component').then((m) => m.LoginComponent) },
    },

    { path: 'login/:id', component: LoginComponent },
    {
        path: 'login',
        pathMatch: 'full',
        loadComponent: () => { return import('./features/login/login.component').then((m) => m.LoginComponent) },
    },
    {
        path: 'signup',
        pathMatch: 'full',
        loadComponent: () => { return import('./features/sign-up/sign-up').then((m) => m.SignUp) },
    },

    {
        path: 'dash',
        pathMatch: 'full',
        loadComponent: () => { return import('./dash/dash').then((m) => m.RevDash) },
    },

    {
        path: 'schedule',
        pathMatch: 'full',
        loadComponent: () => { return import('./schedule/schedule').then((m) => m.Schedule) },
    },
    {
        path: 'schedule/specialty/:id',
        loadComponent: () =>
            import('./schedule/schedule').then(m => m.Schedule)
    },
    {
        path: 'schedule/doctor/:id',
        loadComponent: () =>
            import('./schedule/schedule').then(m => m.Schedule)
    },
    {
        path: 'emergencycontact',
        pathMatch: 'full',
        loadComponent: () => { return import('./emergencycontact/emergencycontact').then((m) => m.Emergencycontact) },
    },
    {
        path: 'emergenservices',
        pathMatch: 'full',
        loadComponent: () => { return import('./emergency-services/emergency-services').then((m) => m.EmergencyServices) },
    },
    {
        path: 'specialty',
        pathMatch: 'full',
        loadComponent: () => { return import('./specialty/specialty').then((m) => m.Specialty) },
    },


    {
        path: 'allergy',
        pathMatch: 'full',
        loadComponent: () => { return import('./allergy/allergy').then((m) => m.Allergy) },
    },
    {
        path: 'medication',
        pathMatch: 'full',
        loadComponent: () => { return import('./medication/medication').then((m) => m.Medication) },
    },
    {
        path: 'medicalrecords',
        pathMatch: 'full',
        loadComponent: () => { return import('./medical-records/medical-records').then((m) => m.MedicalRecords) },
    },
    {
        path: 'consultationhistory',
        pathMatch: 'full',
        loadComponent: () => {
            return import('./consultation-history/consultation-history').then((m) => m.ConsultationHistory)
        }


    },
    {
        path: 'insurance',
        pathMatch: 'full',
        loadComponent: () => { return import('./insurance/insurance').then((m) => m.Insurance) },
    },
    {
        path: 'profile',
        pathMatch: 'full',
        loadComponent: () => { return import('./profile/profile').then((m) => m.Profile) },
    },
    {
        path: 'profile/settings',
        pathMatch: 'full',
        loadComponent: () => { return import('./profile/settings/settings').then((m) => m.Settings) },
    },
    {
        path: 'profile/settings/password',
        pathMatch: 'full',
        loadComponent: () => { return import('./profile/settings/change-password/change-password').then((m) => m.ChangePassword) },
    },
    {
        path: 'profile/linked-account',
        pathMatch: 'full',
        loadComponent: () => { return import('./profile/linked-account/linked-account').then((m) => m.LinkedAccount) },
    },
    {
        path: 'profile/personalInfo',
        pathMatch: 'full',
        loadComponent: () => { return import('./profile/personal-info/personal-info').then((m) => m.PersonalInfo) },
    },
]






import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private currentSessionSubject = new BehaviorSubject<Session | null>(null);
  private authEventSubject = new BehaviorSubject<string>('');

  currentUser$ = this.currentUserSubject.asObservable();
  currentSession$ = this.currentSessionSubject.asObservable();
  authEvent$ = this.authEventSubject.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.currentSessionSubject.next(session);
      this.currentUserSubject.next(session?.user ?? null);
    });

    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentSessionSubject.next(session);
      this.currentUserSubject.next(session?.user ?? null);
      this.authEventSubject.next(event);
    });
  }

  get session(): Session | null {
    return this.currentSessionSubject.value;
  }

  async getSession(): Promise<Session | null> {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  get user(): User | null {
    return this.currentUserSubject.value;
  }

  async signUp(email: string, password: string): Promise<any> {
    return this.supabase.auth.signUp({
      email,
      password,
    });
  }

  async signIn(email: string, password: string): Promise<any> {
    return this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  async resetPassword(email: string): Promise<any> {
    return this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/admin/login',
    });
  }

  async updatePassword(newPassword: string): Promise<any> {
    return this.supabase.auth.updateUser({ password: newPassword });
  }
}

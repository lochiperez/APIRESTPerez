import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { StudentService } from 'src/app/core/services/student.service';
import { UserService } from 'src/app/core/services/user.service';
import { Student } from 'src/app/shared/interfaces/student.interface';
import { User } from 'src/app/shared/interfaces/user.interface';

@Component({
  selector: 'app-students-details',
  templateUrl: './students-details.component.html',
  styleUrls: ['./students-details.component.scss']
})
export class StudentsDetailsComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();
  user!:User | null; //Datos del usuario logueado
  loading: boolean = false;

  student!: Student; //Estudiante a mostrar detalles

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private studentService: StudentService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loading = true
    this.getUserData();
    this.getStudentDetails();
  }

  getUserData() {
    this.subscriptions.add(
      this.userService.getUserData().subscribe((userData) => {
        this.user = userData;
      })
    );
  }

  getStudentDetails() {
    let id:number = parseInt(this.route.snapshot.paramMap.get('id') as string);
    this.subscriptions.add(
      this.studentService.getStudentById(id).subscribe((res) => {
        this.student = res;
        this.loading = false;
      }, (error) => {
        this._snackBar.open(`${error} - No se pudo recuperar la información del alumno`, 'Cerrar');
        this.router.navigate(['dashboard/students']);
      })
    );
  }

  onClickEdit() {
    this.studentService.setStudentToEdit(this.student)
    .then(() => {
      this.router.navigate(['dashboard/students/studentform']);
    })
    .catch((error) => this._snackBar.open(error.message, 'Cerrar'));
  }

  onDeleteStudent() {
    this.subscriptions.add(
      this.studentService.deleteStudentById(this.student.id).subscribe((res) => {
        this._snackBar.open(`${res.name} ${res.lastname} fue eliminado con exito del listado de alumnos`, 'Ok');
        this.router.navigate(['dashboard/students']);
      }, (error) => {
        this._snackBar.open(`${error} - No se pudo eliminar al alumno`, 'Cerrar');
      })
    );   
  }

  onClickInscription() {
    this.studentService.setStudentToEdit(this.student)
    .then(() => this.router.navigate(['dashboard/inscriptions/addinscription']))
    .catch((error) => this._snackBar.open(error.message, 'Cerrar'))
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}

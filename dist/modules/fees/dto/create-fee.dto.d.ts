export declare class CreateFeeDto {
    studentId: string;
    amount: number;
    dueDate: Date;
    status: 'paid' | 'unpaid' | 'overdue';
}

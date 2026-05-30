use apclote;
SHOW INDEX FROM student_batchs WHERE Non_unique = 0;
use apclote;
select * from student;
ALTER TABLE student_batchs DROP INDEX UKsnhxpibtorraqcivku4vk0x1c;
ALTER TABLE student_batchs
ADD UNIQUE INDEX stdBtchs ( student_id,batchs_id);

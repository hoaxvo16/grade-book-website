import { Modal } from 'react-bootstrap';
import { ClassDetailInfo } from 'shared/models';

interface IProps {
  show: boolean;
  onHide: () => void;
  classInfo: ClassDetailInfo;
}

export const ClassInfoModal = ({ show, onHide, classInfo }: IProps) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Thông tin lớp học
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <b>Tên:</b> {classInfo.name}
        </p>
        <p>
          <b>Mô tả:</b>{' '}
          {classInfo.description !== '' ? classInfo.description : 'Không có'}
        </p>
        {classInfo.isTeacher && (
          <p>
            <b>Mã lớp học:</b> {classInfo.inviteStringStudent}
          </p>
        )}

        <div>
          <b> Cấu trúc điểm:</b>
          <ul>
            {classInfo.assignments.map((assignment) => (
              <li key={assignment.id}>
                {assignment.name}: {assignment.point} điểm
              </li>
            ))}
          </ul>
          {!classInfo.assignments.length && (
            <p>Lớp học này chưa có cấu trúc điểm</p>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer></Modal.Footer>
    </Modal>
  );
};

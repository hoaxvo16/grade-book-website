import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  FilePicker,
  PopupAlert,
  SnackBar,
  Table,
  EmptyData,
} from 'shared/components';
import { ClassDetailInfo, GradeInfo } from 'shared/models';
import { fileService } from 'shared/services';
import { gradeTableViewModel } from './grade-table-view-model';
import { buildCols, buildRows } from './helper';
import { ReviewRequestModal } from './components';

interface IProps {
  classInfo: ClassDetailInfo;
}

const fileTypes: string[] = ['xlsx', 'csv'];

export const ClassGradeTable = observer(({ classInfo }: IProps) => {
  const [defaultFileType, setFileType] = useState<any>('xlsx');
  const [showModal, setShowModal] = useState(false);

  const [success, setSuccess] = useState(false);
  const [reviewAssignment, setReviewAssignment] = useState<GradeInfo>(
    new GradeInfo()
  );
  useEffect(() => {
    gradeTableViewModel.getGradeTable(classInfo.id);
  }, [classInfo.id]);

  const { assignments } = classInfo;
  const { studentGrades } = gradeTableViewModel;

  const uploadGradeList = useCallback(
    async (data: any, id: number) => {
      const result = await gradeTableViewModel.importStudentGrade(
        data,
        classInfo.id,
        id
      );
      if (result) {
        setSuccess(true);
      }
    },
    [classInfo.id]
  );

  const handleColEvent = useCallback(
    (action: string, params: any) => {
      switch (action) {
        case 'export':
          gradeTableViewModel.exportGradeCols(
            studentGrades,
            params.name,
            params.id,
            defaultFileType
          );
          break;
        case 'import':
          uploadGradeList(params.data, params.id);
          break;
        case 'markFinal':
          gradeTableViewModel.updateGradeColStatus(
            true,
            classInfo.id,
            params.id
          );
          break;
        case 'markUnfinished':
          gradeTableViewModel.updateGradeColStatus(
            params.newStatus,
            classInfo.id,
            params.id
          );
          break;
        case 'requestGradeReview':
          const { id } = params;
          const assignment = gradeTableViewModel.studentGrades[0].grades.find(
            (grade) => grade.assignmentId === id
          );
          if (assignment) setReviewAssignment(assignment);
          setShowModal(true);

          break;
        default:
          break;
      }
    },
    [defaultFileType, studentGrades, classInfo.id, uploadGradeList]
  );

  const handleCellEvent = useCallback(
    (action: string, params: any) => {
      switch (action) {
        case 'edit':
          gradeTableViewModel.updateSingleStudentGrade(
            params.value,
            params.newStatus,
            classInfo.id,
            params.colId,
            params.rowId
          );
          break;
        case 'markFinal':
          gradeTableViewModel.updateSingleStudentGrade(
            params.value,
            params.newStatus,
            classInfo.id,
            params.colId,
            params.rowId
          );
          break;

        default:
          break;
      }
    },
    [classInfo.id]
  );
  const changeFileType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setFileType(value);
  };

  const exportGradeTable = useCallback(() => {
    gradeTableViewModel.exportGradeTable(
      studentGrades,
      assignments,
      defaultFileType
    );
  }, [assignments, defaultFileType, studentGrades]);

  const downloadTemplateFile = useCallback(
    (type: 'student' | 'grade') => {
      const headers =
        type === 'student' ? ['MSSV', 'Họ tên'] : ['MSSV', 'Điểm'];
      fileService.writeFile(headers, Array(0), 'sample_file', defaultFileType);
    },
    [defaultFileType]
  );

  const uploadStudentList = useCallback(
    async (data: any) => {
      const result = await gradeTableViewModel.importStudentList(
        data,
        classInfo.id
      );
      if (result) {
        setSuccess(true);
      }
    },
    [classInfo.id]
  );

  const markTableFinished = useCallback(() => {
    gradeTableViewModel.updateTableStatus(true, classInfo.id);
  }, [classInfo.id]);

  return (
    <>
      {classInfo.assignments.length === 0 ? (
        <EmptyData
          message="Bạn chưa có đơn phúc khảo nào."
          src="preview-svgrepo-com.svg"
        />
      ) : (
        <>
          {classInfo.isTeacher && (
            <div className="d-flex justify-content-start ">
              <div className="d-flex flex-row mr-auto my-4">
                <select
                  className="form-select mx-2"
                  onChange={changeFileType}
                  aria-label="Default select example"
                  value={defaultFileType}
                >
                  {fileTypes.map((item, index) => (
                    <option key={`${item}${index}`} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <Dropdown>
                  <Dropdown.Toggle variant="primary" id="dropdown-basic">
                    File
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={exportGradeTable}>
                      Tải xuống toàn bộ bảng điểm
                    </Dropdown.Item>

                    <Dropdown.Item
                      onClick={() => downloadTemplateFile('student')}
                    >
                      Tải xuống template danh sách sinh viên
                    </Dropdown.Item>

                    <Dropdown.Item
                      onClick={() => downloadTemplateFile('grade')}
                    >
                      Tải xuống template cột điểm
                    </Dropdown.Item>

                    <Dropdown.Item as="div">
                      <FilePicker
                        content="Tải lên danh sách sinh viên"
                        onFinish={uploadStudentList}
                        acceptTypes={['xlsx', 'csv', 'xls']}
                      />
                    </Dropdown.Item>

                    <Dropdown.Item onClick={() => markTableFinished()}>
                      Đánh dấu bảng điểm đã hoàn thành
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          )}

          <Table
            columns={buildCols(
              assignments,
              studentGrades,
              handleColEvent,
              classInfo.isTeacher
            )}
            rows={buildRows(
              studentGrades,
              handleCellEvent,
              classInfo.isTeacher
            )}
          ></Table>
          <SnackBar
            show={success}
            type="success"
            message="Thành công"
            onClose={() => setSuccess(false)}
          />
          <PopupAlert
            show={gradeTableViewModel.isError}
            error={gradeTableViewModel.isError}
            message={gradeTableViewModel.message}
            onHide={() => gradeTableViewModel.deleteError()}
          />
          <ReviewRequestModal
            assignment={reviewAssignment}
            onHide={() => setShowModal(false)}
            show={showModal}
            classInfo={classInfo}
          />
        </>
      )}
    </>
  );
});

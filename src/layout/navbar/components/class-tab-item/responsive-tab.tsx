import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useLocation, Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import { classDetailViewModel } from 'shared/view-models';
import { Items } from './tab-item';
import './style/index.css';

export const ResponsiveTab = observer(() => {
  const location = useLocation();
  const id = classDetailViewModel.classInfo.id;
  const url = `/class/${id}`;
  const tokens = location.pathname.split('/');
  const currentLocation = tokens[tokens.length - 1];
  const isTeacher = classDetailViewModel.classInfo.isTeacher;
  let selectedContent = getContent(currentLocation);

  if (selectedContent === '') {
    selectedContent = 'Bảng tin';
  }

  return (
    <Dropdown className="dropdown-custom">
      <Dropdown.Toggle>{selectedContent}</Dropdown.Toggle>
      <Dropdown.Menu>
        {Items.map((item) => {
          if (item.path === 'grade' && !isTeacher) {
            //Warning key props?
            return <React.Fragment key={10}></React.Fragment>;
          }
          return (
            <Dropdown.Item as="div" key={item.id}>
              <div>
                <Link
                  style={{ display: 'flex', padding: 5 }}
                  to={`${url}/${item.path}`}
                >
                  {item.content}
                </Link>
              </div>
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
});

const getContent = (path: string): string => {
  switch (path) {
    case 'grade-table':
      return 'Bảng điểm';
    case 'people':
      return 'Mọi người';
    case 'grade':
      return 'Điểm số';
    default:
      return '';
  }
};

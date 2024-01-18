import Button from "../button/button";
import styles from "./pagination.module.scss";

interface Props {
  handlePrevious: () => void;
  handleNext: () => void;
  currentPage: number;
  totalPages: number;
}

export const Pagination = (props: Props) => {
  return (
    <div
      key="pagination"
      className={styles.paginationContainer}
      style={{ border: "none" }}
    >
      <div className={styles.paginationButton1}>
        <Button
          onClick={props.handlePrevious}
          disabled={props.currentPage == 1}
          width={100}
        >
          Previous
        </Button>
      </div>
      <div className={styles.paginationButton2}>
        <Button
          onClick={props.handleNext}
          disabled={props.currentPage == props.totalPages}
          width={100}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

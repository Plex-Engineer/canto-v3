import Button from "../button/button";
import Icon from "../icon/icon";
import styles from "./pagination.module.scss";
import Text from "@/components/text";

interface Props {
  handlePrevious: () => void;
  handleNext: () => void;
  currentPage: number;
  totalPages: number;
  numbersToDisplay?: number;
  handlePageClick: (index: number) => void;
}

export const Pagination = (props: Props) => {
  const getCurrentPageNumberStyle = (index: number) => {
    if (index == props.currentPage) {
      return {
        backgroundColor: "red",
      };
    }
    return {};
  };
  return (
    <div
      key="pagination"
      className={styles.paginationContainer}
      style={{ border: "none" }}
    >
      {/* <div className={styles.paginationButton1}>
        <Button
          onClick={props.handlePrevious}
          disabled={props.currentPage == 1}
          width={100}
        >
          Previous
        </Button>
      </div> */}
      <div className={styles.paginationRow}>
        <div
          className={styles.paginationIconContainer}
          onClick={() => props.handlePageClick(1)}
        >
          <Icon
            themed
            icon={{
              url: "/paginationLeft.svg",
              size: 18,
            }}
          />
        </div>
        <div
          className={styles.paginationButton}
          onClick={props.currentPage > 1 ? props.handlePrevious : () => {}}
        >
          <Text font="proto_mono" size="lg">
            {" "}
            {"<"}{" "}
          </Text>
        </div>
        {props.numbersToDisplay && (
          <div className={styles.paginationNumbers}>
            <div className={styles.paginationNumbers}>
              {new Array(props.numbersToDisplay)
                .fill(null)
                .map((_, i) => i + 1)
                .map((index) => {
                  return (
                    <div
                      key={index}
                      className={styles.paginationNumber}
                      onClick={() => props.handlePageClick(index)}
                      style={getCurrentPageNumberStyle(index)}
                    >
                      <Text font="proto_mono" size="sm">
                        {index}
                      </Text>
                    </div>
                  );
                })}
            </div>
            <div>
              <Text font="proto_mono" size="lg">
                {". . ."}
              </Text>
            </div>
            {
              <div className={styles.paginationNumbers}>
                {new Array(props.numbersToDisplay)
                  .fill(null)
                  .map(
                    (_, i) =>
                      props.totalPages - (props.numbersToDisplay ?? 0) + (i + 1)
                  )
                  .map((index) => {
                    return (
                      <div
                        key={index}
                        className={styles.paginationNumber}
                        onClick={() => props.handlePageClick(index)}
                        style={getCurrentPageNumberStyle(index)}
                      >
                        <Text font="proto_mono" size="sm">
                          {index}
                        </Text>
                      </div>
                    );
                  })}
              </div>
            }
          </div>
        )}
        <div
          className={styles.paginationButton}
          onClick={
            props.currentPage < props.totalPages ? props.handleNext : () => {}
          }
        >
          <Text font="proto_mono" size="lg">
            {" "}
            {">"}{" "}
          </Text>
        </div>
        <div
          className={styles.paginationIconContainer}
          onClick={() => props.handlePageClick(props.totalPages)}
        >
          <Icon
            themed
            icon={{
              url: "/paginationRight.svg",
              size: 18,
            }}
          />
        </div>
      </div>
      {/* <div className={styles.paginationButton2}>
        <Button
          onClick={props.handleNext}
          disabled={props.currentPage == props.totalPages}
          width={100}
        >
          Next
        </Button>
      </div> */}
    </div>
  );
};

import Button from "../button/button";
import Icon from "../icon/icon";
import styles from "./pagination.module.scss";
import Text from "@/components/text";

interface Props {
  currentPage: number;
  totalPages: number;
  numbersToDisplay?: number;
  handlePageClick: (index: number) => void;
}

export const Pagination = (props: Props) => {
  return (
    <div
      key="pagination"
      className={styles.paginationContainer}
      style={{ border: "none" }}
    >
      <div className={styles.paginationRow}>
        <div
          className={styles.paginationIconContainer}
          onClick={() => props.handlePageClick(1)}
          style={{
            opacity: props.currentPage == 1 ? "0.4" : "1",
          }}
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
          onClick={
            props.currentPage > 1
              ? () => props.handlePageClick(props.currentPage - 1)
              : () => {}
          }
        >
          <Text
            font="proto_mono"
            size="lg"
            opacity={props.currentPage == 1 ? 0.4 : 1}
          >
            {" "}
            {"<"}{" "}
          </Text>
        </div>
        <div className={styles.paginationNumbers}>
          <div className={styles.paginationNumbers}>
            {new Array(props.totalPages)
              .fill(null)
              .map((_, i) => i + 1)
              .map((index) => {
                return (
                  <div
                    key={index}
                    className={styles.paginationNumber}
                    onClick={() => props.handlePageClick(index)}
                  >
                    <Text
                      font="proto_mono"
                      size="sm"
                      opacity={index == props.currentPage ? 1 : 0.4}
                    >
                      {index}
                    </Text>
                  </div>
                );
              })}
          </div>
          {/* <div>
              <Text font="proto_mono" size="lg">
                {". . ."}
              </Text>
            </div> */}
          {/* {
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
            } */}
        </div>

        <div
          className={styles.paginationButton}
          onClick={
            props.currentPage < props.totalPages
              ? () => props.handlePageClick(props.currentPage + 1)
              : () => {}
          }
        >
          <Text
            font="proto_mono"
            size="lg"
            opacity={props.currentPage == props.totalPages ? 0.4 : 1}
          >
            {" "}
            {">"}{" "}
          </Text>
        </div>
        <div
          className={styles.paginationIconContainer}
          onClick={() => props.handlePageClick(props.totalPages)}
          style={{
            opacity: props.currentPage == props.totalPages ? "0.4" : "1",
          }}
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
    </div>
  );
};
